import React from 'react'


const page = () => {
  return (
    <div className='md:mx-10 mx-5 mt-10'>

      <div className='flex flex-col lg:flex-row  justify-between items-center'>
          <video autoPlay loop muted playsInline className="">
              <source src="/ConverterPageGif.webm" type="video/webm" width={200} />
            </video>

            <div className='space-y-5'>
              <p className='text-[#333333] md:text-3xl font-semibold'>Convert your audio in <br /> seconds</p>
              <p className='text-[#494949] text-sm'>Upload any audio file and convert it yo the right format, ready for <br /> distribution</p>

            {/* <button className="border-[1.5px] border-[#6B6B11] rounded-[15px] px-4 py-2 capitalize text-sm hover:bg-[#F0F0E7] "> */}


              <button className='bg-[#11456B] rounded-[15px] px-5 py-1 text-white '> Try it now</button>

            </div>
      </div>

     

    </div>
  )
}

export default page