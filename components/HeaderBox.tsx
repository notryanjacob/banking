import React from 'react'

const HeaderBox = ({ type = "title", title, user, subtext }: HeaderBoxProps) => {
    return (
        <div>
            <div className="flex flex-col bg-red">
                <h1 className="header-box-title">
                    {title}
                    {type === 'greeting' && (
                        <span className="text-bankGradient">
                            &nbsp;{user}
                        </span>
                    )}
                </h1>
                <p className="header-box-subtext">{subtext}</p>
            </div>
        </div>
    )
}

export default HeaderBox
