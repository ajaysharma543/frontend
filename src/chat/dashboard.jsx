import Leftchat from './leftchat';
import Rightchat from './rightchat';
import Search from './search';
import bg from '../assets/OIP (1).jpeg';
import { useState } from 'react';
import { useAuth } from '../context/context';

function Dashboard() {
  const [search, setsearch] = useState('');
  const { selectedchat } = useAuth();

  const hasChatOpen = !!selectedchat?._id;

  return (
    <>
 <div
  className="fixed inset-0 bg-black flex flex-col overflow-hidden"
  style={{ backgroundImage: `url(${bg})` }}
>
        {/* Search: hidden on mobile when a chat is open, always shown on md+ */}
        <div className={`${hasChatOpen ? 'hidden' : 'block'} md:block shrink-0 p-0`}>
          <Search setsearch={setsearch} />
        </div>

        <div className="flex flex-1 overflow-hidden md:p-1">
          {/* Left chat: full-bleed on mobile, framed card on md+ */}
          <div
            className={`${hasChatOpen ? 'hidden' : 'flex'} md:flex w-full md:w-[30%] border-r bg-white m-0 md:m-3 md:mr-2 overflow-y-auto`}
          >
            <Leftchat search={search} setsearch={setsearch} />
          </div>

          {/* Right chat: full-bleed on mobile, framed card on md+ */}
          <div
            className={`${hasChatOpen ? 'flex' : 'hidden'} md:flex w-full md:w-[70%] bg-white m-0 md:m-3 md:ml-1 overflow-y-auto`}
          >
            <Rightchat />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;