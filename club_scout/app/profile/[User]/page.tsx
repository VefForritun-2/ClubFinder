
import { getUserData,signOut,getAllClubsData,listOfMembersOfClubs,ownedClubs} from "@/app/library/actions"
import { Suspense } from "react"
import { cookies } from 'next/headers'
import { redirect } from "next/navigation"
import  clubsInfo  from "@/app/components/profileMemberClubs"
import Link from "next/link"



export default async function Page({params}: {params:Promise<{User:string}>}){

    //sækjir gögn og búar til listi af clubs sem notandinn er member of
    const user = (await params).User
    const userData = await getUserData(user)
    const allClubs = await getAllClubsData()
    const cookie = await cookies()
    const memberOfClubs = await listOfMembersOfClubs(Number(userData.id))
    const userOwnedClubs = await ownedClubs(userData.id)

    let listOfClubs = []
    let listofOwnedClubs = []
    // ef ekki með cookie eða ekki með rétt cookie
    if (!cookie.has("haveSignedIn") || cookie.get("haveSignedIn")?.value !== userData.user_name){
        redirect("/logIn-SignUp/log_in")
    }
        
    else if(cookie.has("haveSignedIn") && cookie.get("haveSignedIn")?.value == userData.user_name){// þarf "?"

        // sækjir clubs sem notandinn er members of
        for (let x of memberOfClubs){
            for (let i of allClubs){
                if (i.id === x){
                    listOfClubs.push(clubsInfo(i.name,i.description,i.img,x,false))

                }
            }
        }
        for (let x of userOwnedClubs){
            listofOwnedClubs.push(clubsInfo(x.name,x.description,x.img,x.id,true,userData.user_name))
        }

        /* // old code
        for (let x of members){
            if (userData.id === x.profile_id){
                for (let i of allClubs){
                    if (i.id === x.id){
                        listOfClubs.push(clubsInfoOfMember(i.name,i.description,i.img,x.club_id))
                    }
                }
                
            }
        }*/
        
        return(
            <div>
                <h2>velkominn!</h2>
                <h3>{userData.user_name}!</h3>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>

                    <div>
                    <h2>Member of:</h2>
                    {listOfClubs.map((a)=>a)}
                    </div>

                    <div>
                    <h2>Owned clubs:</h2>
                    {listofOwnedClubs.map((a)=>a)}
                    </div>
                </div>

                <Link href={"/profile/"+cookie.get("haveSignedIn")?.value+"/newClub"}>create new club</Link>

                <button onClick={signOut}>sign out</button>
                <Link href={"/profile/"+cookie.get("haveSignedIn")?.value+"/settings"}>Profile Settings</Link>
            </div>
        )
    }
    
}