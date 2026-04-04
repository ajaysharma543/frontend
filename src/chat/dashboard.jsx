import Leftchat from './leftchat';
import Rightchat from './rightchat';
import Search from './search';
import bg from '../assets/OIP (1).jpeg';
import { useState } from 'react';
function Dashboard() {
  const [search, setsearch] = useState('');

  return (
    <>
      <div
        className="h-screen bg-black flex flex-col overflow-hidden"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="flex-shrink-0 p-0">
          <Search setsearch={setsearch} />
        </div>

        <div className="flex flex-1 overflow-hidden p-1">
          <div className="w-[30%] border-r bg-white m-3 mr-2 overflow-y-auto">
            <Leftchat search={search} setsearch={setsearch} />
          </div>

          <div className="w-[70%] bg-white m-3 ml-1 overflow-y-auto">
            <Rightchat />
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
