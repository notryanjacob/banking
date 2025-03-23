'use server'

import { createAdminClient, createSessionClient } from "@lib/appwrite";
import { plaidClient } from "@lib/plaid";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "@lib/utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,
} = process.env;

export const signIn = async ({ email, password }: signInProps) => {
    try {
        const { account } = await createAdminClient();

        const response = await account.createEmailPasswordSession(email, password);
        return parseStringify(response);
    } catch (error) {
        console.log(error);
    }
}

export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const { email, firstName, lastName } = userData;

    let newUserAccount
    try {
        const { account, database } = await createAdminClient();

        newUserAccount = await account.create(ID.unique(), email!, password, `${firstName} ${lastName}`);
        if (!newUserAccount) throw new Error('User account not created');

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: 'personal'
        });

        if (!dwollaCustomerUrl) throw new Error('Dwolla customer not created');

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

        const newUser = await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        )

        const session = await account.createEmailPasswordSession(email!, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        return parseStringify(newUser);
    } catch (error) {
        console.log(error);
    }
}

// ... your initilization functions

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();

        return parseStringify(user);
    } catch (error) {
        return null;
    }
}

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();

        cookies().delete('appwrite-session');

        await account.deleteSession('current')
    } catch (error) {
        return null;
    }
}

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate(tokenParams);

        return parseStringify({ linkToken: response.data.link_token })
    } catch (error) {
        console.log(error);
    }
}

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId,
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId
            }
        )
        return parseStringify(bankAccount);
    } catch (error) {

    }
}

export const exchangePublicToken = async ({ publicToken, user }: exchangePublicTokenProps) => {
    try {
        //Exchange public token for access token and tokenId
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemID = response.data.item_id;

        //Get account info from plaid using access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];

        // Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenReponse = await plaidClient.processorTokenCreate(request);
        const processToken = processorTokenReponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        //If the funding souce URL is not created, throw an error
        if (!fundingSourceUrl) throw Error;

        //Create a bank account using the user ID, item ID, account ID and access token
        //funding souce URl, ans shareable ID
        const bankAccount = await createBankAccount({
            userId: user.$id,
            bankId: itemID,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });

        //Revalidate the path to relect the changes
        revalidatePath("/");

        //Return success message
        return parseStringify({
            publicTokenExchange: "complete",
        });

    } catch (e) {
        console.log("An error occurred while creating exchange token: ", e);
    }
}
