import { onlinePressPackages } from '@/app/constant';
import { country_list } from '@/app/utils/constants';
import Select from '@/components/Select';
import { useTabQuery } from '@/util/customHooks/useTabQuery';
import Image from 'next/image';
import React from 'react'

const OnlinePressForm = () => {
      const { setParam, getParam, deleteParam } = useTabQuery();
  const [promotionForm, setPromotionForm] = React.useState({
    artist: "",
    songTitle: "",
    songDescription: "",
    promotionPackage: "",
    promotionType: "boomplay",
  });
  return (
       <>
         <div className="bg-main-white max-sm:min-h-auto min-h-[90.5dvh] h-full w-full flex flex-col ">
           {/* back button */}
           <div className="max-w-[1200px] px-10">
             <div className="flex items-center mt-5">
               <button
                 aria-label="go back"
                 onClick={() => {
                   deleteParam("promotionType");
                 }}
                 // className="bg-main-white/70 p-3 w-[48px] h-[48px] text-primary text-2xl rounded-full shadow-2xl shadow-black mb-9"
               >
                 <Image
                   src={"/arrow-left.svg"}
                   height={28}
                   width={20}
                   alt="arrow left"
                 />
               </button>
               <p className="text-text-body text-body-two-regular px-5">
                 Select the track you want to promote
               </p>
             </div>
             {/* form */}
             <div className="mt-10 flex flex-col gap-5 mb-10">
               <div className="w-full flex flex-wrap justify-between gap-y-10">
                 <div className="flex flex-col w-[40%] max-sm:w-full">
                   <p className="font-medium mb-2 sm:text-sm text-lg">Artist</p>
                   <div className="w-full">
                     <Select
                       selected={promotionForm.artist}
                       setSelected={(t) =>
                         setPromotionForm((prev) => ({ ...prev, artist: t }))
                       }
                       placeholder="Select Artist..."
                       options={country_list}
                       name="artist"
                     />
                   </div>
                 </div>
                 <div className="flex flex-col w-[40%] max-sm:w-full">
                   <p className="font-medium mb-2 sm:text-sm text-lg">Songs</p>
                   <div className="w-full">
                     <Select
                       selected={promotionForm.songTitle}
                       setSelected={(t) =>
                         setPromotionForm((prev) => ({ ...prev, songTitle: t }))
                       }
                       placeholder="Select Song..."
                       options={[]}
                       name="songTitle"
                     />
                   </div>
                 </div>
               </div>
               <div>
                 <div className="flex gap-1 sm:text-sm text-lg">
                   <p className=" capitalize font-medium">Music Description </p>
                 </div>
   
                 <textarea
                   value={promotionForm.songDescription}
                   onChange={(e) =>
                     setPromotionForm((prev) => ({
                       ...prev,
                       songDescription: e.target.value,
                     }))
                   }
                   className="w-full sm:w-[70%] min-h-80 border-2 rounded-2xl p-4 mt-1"
                   placeholder="Music Description..."
                 ></textarea>
               </div>
               <div className="w-full flex flex-wrap justify-between gap-y-10">
                 <div className="flex flex-col w-[40%] max-sm:w-full">
                   <p className="font-medium mb-2 sm:text-sm text-lg">Package</p>
                   <div className="w-full">
                     <Select
                       selected={promotionForm.promotionPackage}
                       setSelected={(t) =>
                         setPromotionForm((prev) => ({
                           ...prev,
                           promotionPackage: t,
                         }))
                       }
                       placeholder="Select Package..."
                       options={onlinePressPackages}
                       name="promotionPackage"
                     />
                   </div>
                 </div>
                 {/* <div className="flex flex-col w-[40%] max-sm:w-full">
                   <p className="font-medium mb-2 sm:text-sm text-lg">Songs</p>
                   <div className="w-full">
                     <Select
                       selected={promotionForm.songTitle}
                       setSelected={(t) =>
                         setPromotionForm((prev) => ({ ...prev, songTitle: t }))
                       }
                       placeholder="Select Song..."
                       options={[]}
                       name="songTitle"
                     />
                   </div>
                 </div> */}
               </div>
             </div>
             {/* total */}
             <div className="w-full border-2 border-main-icon-color p-1 rounded-2xl mb-60">
               <div className="bg-neutral-50 border-2 border-neutral-100 flex flex-col p-5 rounded-2xl items-center w-full capitalize gap-5">
                 <p className="text-body-two-regular font-semibold text-text-disable">
                   Total Amount Due
                 </p>
                 <p className="text-h5-semibold h-5 text-main-icon-color">{promotionForm.promotionPackage?.split("|")[1]}</p>
               </div>
             </div>
           </div>
           <div className="flex py-3 w-full h-fit bg-secondary-50 self-end justify-end mt-auto border-1 border-neutral-100 fixed bottom-0">
             <button
               onClick={() => {
                 // setIsExplorePage(true);
               }}
               type="button"
               className={
                 "px-5 py-2 font-bold rounded-lg text-center max-w-fit hover:cursor-pointer text-sm bg-primary hover:bg-primary/90 text-white"
               }
             >
               Confirm Request
             </button>
           </div>
         </div>
       </>
  )
}

export default OnlinePressForm