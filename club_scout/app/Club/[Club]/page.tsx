import { getClubData,joinClub } from "@/app/library/actions"
import { cookies } from "next/headers"

export default async function Club({params}:{params:Promise<{Club:string}>}) {

    const club = (await params).Club
    const cookie = await cookies()
    const dataOfClub = await getClubData(Number(club))
    let join_text = "Log in to join!"// má ekki setja þetta í else{} því það mun "ekki finna join_text"

    if (cookie.has("haveSignedIn")){
        join_text = "Join"
    }
    

    console.log(dataOfClub)
    return(
        <div>
            <h1>Velkominn til {dataOfClub.name}</h1>
            <img src={dataOfClub.logo} alt={dataOfClub.img} />
            <p>Description: {dataOfClub.description}</p>

            <p>This club was made in {dataOfClub.created_at.split("T")[0]}</p>

            <form action={joinClub}>{/* notar server side */}
                <input style={{display:"none"}} name="club_id" value={dataOfClub.id} />
                <button type="submit">{join_text}</button>
            </form>

        </div>
    )
    
}