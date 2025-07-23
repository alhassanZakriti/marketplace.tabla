"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Sidebar } from "../../components/profile/SideBar"
import { MyInformation } from "../../components/profile/MyInformation"
import { MyReservations } from "../../components/profile/MyReservations"
import { MyFavorites } from "../../components/profile/MyFavorites"

type ActiveSection = "information" | "reservations" | "favorites"

export const ProfilePage: React.FC = () => {

    useEffect(() => {
        document.title = "Profile - Tabla | Taste Morocco's Best"
    }, [])

  const [activeSection, setActiveSection] = useState<ActiveSection>("information")

  const renderActiveSection = () => {
    switch (activeSection) {
      case "information":
        return <MyInformation />
      case "reservations":
        return <MyReservations />
      case "favorites":
        return <MyFavorites />
      default:
        return <MyInformation />
    }
  }

  return (
    <div className=" bg-whitetheme min-h-[88vh] py-4 dark:bg-bgdarktheme rounded-lg shadow-md">
        <div className="flex flex-col gap-3 md:flex-row  max-w-[1200px] mx-auto bg-whitetheme dark:bg-bgdarktheme transition-colors duration-200">
            <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

            <main className="flex-1 ">
                <div className="bg-white dark:bg-darkthemeitems rounded-lg shadow-md p-6 transition-colors duration-200">
                {renderActiveSection()}
                </div>
            </main>
        </div>
    </div>
  )
}

export default ProfilePage
