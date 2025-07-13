import { Button } from "../ui/Button"

const NewsletterTape = () => {
  return (
    <div className="w-full py-10 sm:px-[10em] flex flex-col md:flex-row lt-lg:text-center gap-4 bg-greentheme dark:bg-darkthemeitems mb-3  items-center justify-between ">
      <div className="flex flex-col text-white">
        <h1 className="">Get notification from us every update!</h1>
        <h4 className="">Subscribe & Get all notification from us</h4>
      </div>
      <form className="bg-white  dark:bg-bgdarktheme w-[90vw] flex p-2 justify-between rounded-xl sm:w-[30em] gap-3 ">
        <input type="email" placeholder="Enter your Email" className="inputs w-full dark:bg-bgdarktheme"/>
        <Button
            variant="primary"
            className="ml-2"
            >
            Subscribe    
        </Button> 
      </form>
    </div>
  )
}

export default NewsletterTape
