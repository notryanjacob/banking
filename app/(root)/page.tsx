import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@components/RightSidebar';
import TotalBalanceBox from '@components/TotalBalanceBox';
import React from 'react'


const Home = () => {
  const loggedIn = { firstName: "Ryan", lastName: "Jacob", email: "ryanj1504@gmail.com" };
  return (
    <section className="home bg-white">
      <div className="home-content">
        <header className="home-header">
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Access and manage your accounts and transactions efficiently"
          />
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1250.35}
          />
        </header>

        RECENT TRANSACTIONS
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 123.5 }, { currentBalance: 200 }]}
      />
    </section>
  )
}

export default Home
