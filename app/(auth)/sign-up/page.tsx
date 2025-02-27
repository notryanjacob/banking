import AuthForm from '@components/AuthForm'
import { getLoggedInUser } from '@lib/actions/user.actions';
import React from 'react'

const SignUp = async () => {
    const loggedInUser = await getLoggedInUser();

    console.log(loggedInUser);
    return (
        <div className='flex-center size-full max-sm:px-6'>
            <AuthForm type='sign-up' />
        </div>
    )
}

export default SignUp
