import { formatAmount } from '@lib/utils'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const BankCard = ({ account, userName, showBalance = true }: CreditCardProps) => {
    return (
        <div>
            <div className="flex flex-col">
                <Link href='/' className='bank-card'>
                    <div className="bank-card_content">
                        <div>
                            <h1 className="text-white font-semibold text-16">
                                {account.name || userName}
                            </h1>
                            <p className="font-ibm-plex-serif font-black text-white">
                                {formatAmount(account.currentBalance)}
                            </p>
                        </div>

                        <article className='flex flex-col gap-2'>
                            <div className="flex justify-between">
                                <h1 className="text-12 text-white font-semibold">
                                    {userName}
                                </h1>
                                <h2 className="text-12 text-white font-semibold">
                                    ●● / ●●
                                </h2>
                            </div>
                            <p className="text-white font-semibold tracking-[1.1px] text-14">
                                ●●●● ●●●● ●●●● <span className="text-16">1234</span>
                            </p>
                        </article>
                    </div>
                    <div className="bank-card_icon">
                        <Image
                            src="/icons/Paypass.svg"
                            alt='pay'
                            height={20}
                            width={24}
                        />
                        <Image
                            src="/icons/mastercard.svg"
                            alt='mastercard'
                            height={45}
                            width={32}
                            className='ml-5'
                        />
                        <Image
                            src='/icons/lines.png'
                            alt='lines'
                            width={360}
                            height={190}
                            className='absolute top-0 left-0'
                        />
                    </div>
                </Link>

            </div>
        </div>
    )
}

export default BankCard
