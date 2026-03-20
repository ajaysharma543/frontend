import Leftchat from "./leftchat";
import Rightchat from "./rightchat";
import Search from "./search";
import bg from "../assets/OIP (1).jpeg"
import { useState } from "react";
function Dashboard() {
    const [search, setsearch] = useState("");
    const [data,setdata] = useState(null)
 


  return (
   <>
     <div className="h-screen bg-black flex flex-col overflow-hidden"
     style={{ backgroundImage: `url(${bg})` }}>
  
  {/* Top Search Bar */}
  <div className="flex-shrink-0 p-0">
    <Search setsearch = {setsearch}/>
  </div>

  {/* Chat Section */}
  <div className="flex flex-1 overflow-hidden p-1">
    
    <div className="w-[30%] border-r bg-white m-3 mr-2 overflow-y-auto">
      <Leftchat  search={search}  setdata={setdata} data={data}/>
    </div>

    <div className="w-[70%] bg-white m-3 ml-1 overflow-y-auto">
      <Rightchat key={data?._id} data={data} />
    </div>

  </div>

</div>
   </>
  );
}

export default Dashboard;