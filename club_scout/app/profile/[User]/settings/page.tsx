
import { getUserData,changeInfoAboutUser,changePassword,getPreferences, getUserPreferences,UploadUserImg} from "@/app/library/actions"

export default async function Page({params}: {params:Promise<{User:string}>}){

    const user = (await params).User
    const userData = await getUserData(user)
    const prefernces = await getPreferences()
    const usersPrefences = await getUserPreferences(userData.id)

    let preferencesOfUser = []

    for (let x of usersPrefences){
        if (x.profile_id === userData.id){
            preferencesOfUser.push(x.preference_id)
        }
    }

    return(
        <div>
            <h2>welcome to settings {userData.user_name}</h2>


            <h3>change info about yourself</h3>

            {/* controlled component shit kannski þarf að laga þetta (fyrir inputs ekki formið sjálf) */}
            <form action={changeInfoAboutUser}>
                
                <input type="hidden" name='old_username' defaultValue={userData.user_name}/>

                <label htmlFor="username">username:</label>
                <input name='username' id="username" defaultValue={userData.user_name} />

                <label htmlFor="email">email:</label>
                <input type='email' id="email" name="email" defaultValue={userData.email} />

                
                <label htmlFor="preferences">preferences:</label>{/* við getum breyt þetta til option element og finna eih leið til að sækja multiple values */}
                <div id="preferences">
                {prefernces?.map((a) => {

                    if (preferencesOfUser.includes(a.id)){
                        return <div key={a.id}><input type="checkbox" name={a.preference} defaultChecked /> {a.preference}</div>
                    }

                    return <div key={a.id}><input type="checkbox" name={a.preference}/> {a.preference}</div>
                    })}
                </div>

                {/*<input type="file" name="profile_file" id="abc"/>  // við mun örugg bætt við buckets á eftir*/}

                {/* kannski bætt við file input eða url input */}

                <button type='submit'>save Changes</button>
            </form>

            <h2>change password</h2>
            <form action={changePassword}>

                <input type='hidden' name="username" value={userData.user_name} />

                <input type='password' name='password' />

                <input type='password' name="passwordCheck" />

                <button type='submit'>Change password</button>

            </form>
            <h2>Chose Profile image</h2>
            <form action={UploadUserImg}>
                <input name="file" id="" type="file"/>
                <button type="submit">Submit</button>
                </form>
        </div>
    )

}