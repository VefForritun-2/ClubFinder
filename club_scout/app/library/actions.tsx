"use server";
import { supabase } from "@/app/library/supabaseClients";
import { redirect } from "next/navigation"
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers'
import memberOfClubs from "../components/profileMemberClubs";
import { useId } from "react";
import { console } from "inspector";


export async function sign_up(formdata: FormData){
    // sækja sign up form gögn
    const signUpFormData = {
        username: formdata.get("username"),
        password: formdata.get("password"),
        passwordCheck: formdata.get("passwordCheck")
    }
    const preferences = await getPreferences()

    let isChecked = false
    let listOfPreferences = []

    for (let x of preferences){
        if (formdata.get(String(x.preference)) === "on"){
            isChecked = true
            listOfPreferences.push(x)
        }
    }
    
    // ká ef password og passwordCheck eru eins og svo búa til nýja profile

    if (signUpFormData.password === signUpFormData.passwordCheck && String(signUpFormData.password).length >= 8 && isChecked === true && !String(signUpFormData.username).includes(" ")) {

        const { data,error } = await supabase
        .from('profiles')
        .insert([
          { user_name: signUpFormData.username, password: signUpFormData.password, email:"" }
        ]).select()

        const signUpData = data
        console.log("sss",signUpData)
        if (error){
            console.log("ERROR, í sign up á meðan að insert-a nýja profie:",error)
        }
        else if(!error){

            for (let x of listOfPreferences){
                if (formdata.get(x.preference) === "on"){          
                    const {error} = await supabase.from("member_preferences").insert({profile_id: signUpData[0].id,preference_id:x.id})

                    if (error){
                        console.log("ERROR í sign up á meðan að setja preferences fyrir profile:",error)
                    }
                }
            }
            
            
        }
        
        redirect("/logIn-SignUp/log_in")
        
        
    }
    else{
        const cookie = await cookies()

        if (signUpFormData.password !== signUpFormData.passwordCheck){
            cookie.set("error","password is not the same as the password check",{maxAge:2})
        }
        else if (String(signUpFormData.password).length < 8){
            cookie.set("error","password needs to be 8 in length or longer",{maxAge:2})
        }
        else if (isChecked === false){
            cookie.set("error","you need to pick atleast one preference",{maxAge:2})
        }
        else if (String(signUpFormData.username).includes(" ")){
            cookie.set("error","spaces in usernames are not allowed",{maxAge:2})
        }
        else {
            cookie.set("error","there was an error while signing you up",{maxAge:2})
        }

        redirect("/logIn-SignUp/sign_up")
        // rendera eitthvað sem sýnir notandinn að lykilorðið voru ekki eins
    }
    // þarf að finna út hvernig að byrta eitthvað þegar eitthvað er að og kannski gera layout
    // gera kafli 14 í next.js
}

export async function sign_in(formdata:FormData) {

    // sækja sign in form gögn
    const signInFormData = {
        username: formdata.get("username"),
        password: formdata.get("password"),
    }

    const cookie = await cookies()

    // checka ef username og password eru strings svo reynir að finna notandan profile'ið og redirect-a til profile síðan
    if (typeof signInFormData.username === 'string' && typeof signInFormData.password === 'string'){

        // sækjir supabase gögn af profiles
        const { data, error } = await supabase
        .from('profiles')
        .select()

        if (error){
            console.log("ERROR í log in:",error)
        }

        let foundUser = false
        
        for (let x of data){
            if (x.user_name == signInFormData.username && x.password == signInFormData.password){
               (await cookies()).set("haveSignedIn",x.user_name)
               foundUser = true
                redirect("/profile/"+signInFormData.username)//má líka vera id
            }
        }
        if (foundUser === false){
            const cookie = await cookies()
            cookie.set("error","Wrong username or password",{maxAge:2})
            redirect("/logIn-SignUp/log_in")

        }

    }
    else{
        const cookie = await cookies()
        cookie.set("error","something went wrong while loggin you in",{maxAge:2})
        redirect("/logIn-SignUp/log_in")

    }
}

// delete-a cookie af notandan
export async function signOut() {
    const cookie = await cookies() 
    cookie.delete("haveSignedIn")
    redirect("/logIn-SignUp/log_in")
}

// sækjir gögn af notandan
export async function getUserData(user:string){

    // sækjir supabase gögn af profiles
    const { data, error } = await supabase
    .from('profiles')
    .select()

    if (error){
        console.log("ERROR í getUserData:",error)
    }

    // reynir að finna profile'ið notandan's og svo returna gögnin
    for (let x of data){
        if (x.user_name == user){
            return x
        }
    }
}

export async function joinOrLeaveClub(formdata: FormData){

    const club_id = formdata.get("club_id")
    const type = formdata.get("type")

    const cookie = await cookies()
    const user = await getUserData(cookie.get("haveSignedIn")?.value)//ignore þetta

    if (!cookie.has("haveSignedIn")){
        redirect("/logIn-SignUp/log_in")
    }
    else if (type == "join"){

        const { error } = await supabase
        .from('club_members')
        .insert([
          { profile_id:user.id,club_id:club_id },
        ])

        if (error){
            console.log("ERROR, í sign up:",error)
        }

        // refresh-a síðan hjá notandinn og redirect-a til síðan til að double checka
        revalidatePath("/Club/"+club_id)
        redirect("/Club/"+club_id)

    }
    else if (type=="leave"){

        const {error} = await supabase.from('club_members').delete().eq("profile_id",user.id).eq("club_id",club_id)

        if (error){
            console.log("ERROR: í joinOrLeaveClub þegar reyna að leave-a club, info:",error)
        }

        // refresh-a síðan hjá notandinn og redirect-a til síðan til að double checka
        revalidatePath("/Club/"+club_id)
        redirect("/Club/"+club_id)
    }
    else{
        console.log("ERROR: í joinOrLeaveClub, enginn statements voru keyrið")
    }
}

export async function listOfMembersOfClubs(user_id:Number){
    const members = await getMembers()
    let lists = []

    for (let x of members){
        if (user_id == x.profile_id){
            lists.push(x.club_id)
        }
    }
    return lists
}

export async function getAllClubsData(){

    // sækjir supabase gögn af clubs
    const { data, error } = await supabase
    .from('clubs')
    .select()

    if (error){
        console.log("ERROR í getAllClubsData:",error)
    }


    return data
}

export async function getClubData(clubID:number){
        // sækjir supabase gögn af clubs
        const { data, error } = await supabase
        .from('clubs')
        .select()
    
        if (error){
            console.log("ERROR í getClubData:",error)
        }

    // reynir að finna gögn af club'ið með nafnið og svo returna gögnin
    for (let x of data){        
        if (x.id == clubID){      
            return x
        }
    }
}

export async function getMembers() {
    const { data, error } = await supabase
    .from('club_members')
    .select()

    if (error){
        console.log("ERROR í getMembers:",error)
    }

    return data
}

export async function changeInfoAboutUser(formdata:FormData) { // BÆTT VIÐ FILE STUFF NÆSTA TÍMA -_-____-----_----_

    const changedInfo = {
        oldUsername: formdata.get("old_username"),
        username: formdata.get("username"),
        email: formdata.get("email"),
        img: formdata.get("img")
    }

    const userData = await getUserData(String(changedInfo.oldUsername))
    const cookie = await cookies()
    const userPrefences = await getUserPreferences(userData.id)
    const preferences = await getPreferences()
    
    let listOfFormPreferences = []
    let listOfUserPreferences = []

    for (let x of preferences){
        if (formdata.get(String(x.preference)) === "on"){
            listOfFormPreferences.push("on")
        }
        else{
            listOfFormPreferences.push(null)
        }
    }
    
    for (let x of userPrefences){
        if (x.profile_id === userData.id){
            
            listOfUserPreferences.push(String(x.preference_id))            
        }
    }

    for ( let x = 0; x<listOfFormPreferences?.length;x++ ){
        // ef notandan breytir ekki
        if(listOfFormPreferences[x] === "on" && listOfUserPreferences.includes(String(x+1)) || listOfFormPreferences[x] === null && !listOfUserPreferences.includes(String(x+1))){
            
        }
        // ef notandan langar að bætta við nýja preference
        else if (listOfFormPreferences[x] === "on" && !listOfUserPreferences.includes(String(x+1))){
            const {error} = await supabase.from("member_preferences").insert({profile_id: userData.id,preference_id:x+1})

            if (error){
                console.log("ERROR í changeInfoAboutUser, reyndi að bætt við nýja gögn member_preference:",error)
            }
        }
        // ef notandan langar að eyða preference
        else if (listOfFormPreferences[x] === null && listOfUserPreferences.includes(String(x+1))){

            let idRow = undefined
            for (let i of userPrefences){
                if (i.profile_id === userData.id && i.preference_id === x+1){
                    idRow = i.id
                }
            }

            const {error} = await supabase.from("member_preferences").delete().eq("id",idRow)

            if (error){
                console.log("ERROR í changeInfoAboutUser, reyndi að delete-a gögn frá member_preference:",error)
            }

        }
        
    }

    const { error } = await supabase
    .from("profiles")
    .update({ user_name: changedInfo.username, email:changedInfo.email})
    .eq("id",userData.id)

    if (error){
        console.log("ERROR í changeInfoAboutUser, reyndi að update-a info um user:",error)
    }
    
    // breyta cookies og redirecta til profile síðan
    cookie.delete("haveSignedIn")
    cookie.set("haveSignedIn",String(changedInfo.username))

    revalidatePath("/profile/"+changedInfo.oldUsername)
    redirect("/profile/"+changedInfo.username)
} 

export async function changePassword(formdata:FormData){

    const passwordData = {
        username: formdata.get("username"),
        password: formdata.get("password"),
        passwordCheck: formdata.get("passwordCheck")
    }

    const userData = await getUserData(String(passwordData.username))

    if (passwordData.password === passwordData.passwordCheck && String(passwordData.password).length >= 8){
        const { error } = await supabase
        .from("profiles")
        .update({ password: passwordData.password})
        .eq("id",userData.id)

        if (error){
            console.log("ERROR í changepassword:",error)
        }

        revalidatePath("/profile/"+passwordData.username)
        redirect("/profile/"+passwordData.username)
    }
}

export async function getPreferences(){
    const {data,error} = await supabase
        .from("preference")
        .select()

    if (error){
        console.log("ERROR í getPreferences:",error)
    }

    return data
}

export async function getUserPreferences(userId: string) {
    const { data, error } = await supabase
        .from("member_preferences")
        .select()
        .eq("profile_id", userId);  // Retrieve preferences for a specific user

    if (error) {
        console.error("Error fetching user preferences:", error);
        return [];
    }

    return data
}

export async function createClub(formdata: FormData){   

    const cookie = await cookies()
    const preferences = await getPreferences()
    const userData = await getUserData(String(cookie.get("haveSignedIn")?.value))
    const createdClubData = {
        clubName: formdata.get("clubName"),
        description: formdata.get("description"),
        logo: formdata.get("logo")
    }
    if (createdClubData.logo.name != "undefined") {
        const { data, error } = await supabase.storage
        .from('profile pic')
        .upload(createdClubData.logo.name, createdClubData.logo);

    }
    // list af preferences
    let isChecked = false
    let listOfPreferences = []

    for (let x of preferences){
        let checkboxPreference = formdata.get(String(x.preference))
        if (checkboxPreference === "on"){
            isChecked = true
            listOfPreferences.push(x)
        }
        else{

        }
    }

    if (isChecked === false){
        //alert("you didnt pick any preferences!") ------------------------------------------------_-_--_-
        redirect("/profile/"+cookie.get("haveSignedIn")?.value)
    }
    else if (isChecked === true){

        const {data, error} = await supabase.from("clubs").insert({name:createdClubData.clubName,description:createdClubData.description,owner_id:userData.id,img:createdClubData.logo.name}).select()
        const uploadedClubdata = data
        if (error){
            console.log("ERROR í createClub á meðan að setja inn nýja club í supabase:",error)
        }

        // BÆTT KÓÐA SEM BÚAR TIL NÝJA FILE FYRIR BUCKET !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        if (!error){
            const { data, error } = await supabase
                .storage
                .from('profile pic')
                .upload('avatar'+uploadedClubdata[0].id+'.png', createdClubData.logo, {
                    cacheControl: '3600',
                    upsert: false
                })

                console.log("data um logo:",data)
                console.log("error um logo:",error)
        }
        if (!error){

            const {error} = await supabase.from("club_preferences").insert(listOfPreferences.map(a => {return {club_id: data[0].id,preference_id:a.id}}))

            if (error){
                console.log("ERROR á meðan að setja preferences fyrir club:",error)
            }
        }

        redirect("/profile/"+cookie.get("haveSignedIn")?.value)
    }
    else{

    }
    
}

export async function ownedClubs(userID:Number){ // búa til kóða fyrir þetta þegar búinn með createClub
    const allClubs = await getAllClubsData()
    let listOfOwnedClubs = []

    for (let x of allClubs){
        if (userID === x.owner_id){
            listOfOwnedClubs.push(x)
        }
    }
    

    return listOfOwnedClubs
}

export async function editClub(formdata:FormData){
    const cookie = await cookies()
    const preferences = await getPreferences()
    const userData = await getUserData(cookie.get("haveSignedIn")?.value)
    const editedClubData = {
        clubId: formdata.get("clubId"),
        clubName: formdata.get("clubName"),
        description: formdata.get("description"),
        logo: formdata.get("logo")
    }
    let logoimg
console.log(editedClubData.logo)
if (editedClubData.logo.name != "undefined") {
    logoimg = editedClubData.logo.name
    console.log("Uploading image:", logoimg)

    // Attempt to upload the image to Supabase Storage
    const { data, error } = await supabase.storage
        .from('profile pic') // Use a proper bucket name
        .upload(logoimg, editedClubData.logo)
} else {
    // Fallback to user's existing image
    const info = getClubData(editedClubData.clubId)
    logoimg = info.img
    console.log("Using existing user image:", logoimg)
}
    const clubCategories = await club_preferences(Number(editedClubData.clubId))
    let isChecked = false
    let listOfPreferences = []

    for (let x of preferences){
        let checkboxPreference = formdata.get(String(x.preference))
        if (checkboxPreference === "on"){
            isChecked = true
            listOfPreferences.push(x)
        }
        else{

        }
    }

    if (isChecked === false){
        //alert("no preferences chosen!") ------------------------------------------------_-_--_-
        redirect("/profile/"+cookie.get("haveSignedIn")?.value+"/"+editedClubData.clubId)
    }
    else if (isChecked === true){      

        // tók út img:editedClubData.logo frá update hér neðan

        const {error} = await supabase.from("clubs").update({name:editedClubData.clubName,description:editedClubData.description,img:logoimg}).eq("id",Number(editedClubData.clubId))

        if (error){
            console.log("ERROR í editclub á meðan að update-a club data:",error)
        }

        if (!error){ // finish doing the editClub (need to do preferences too)

            let preferencesFormList = []

            for (let x of preferences){
                if (formdata.get(x.preference) === "on"){
                    console.log("THIS ONE IS ONE")
                    preferencesFormList.push("on")

                }
                else {
                    console.log("this ones off")
                    preferencesFormList.push(null)

                }
            }

            let preferencesClubList = []

            for (let x of clubCategories){
                preferencesClubList.push(x.preference_id)
            }

            for (let x = 0;x<preferencesFormList.length;x++){
                if (preferencesFormList[x]==="on" && preferencesClubList.includes(x+1) || preferencesFormList[x] === null && !preferencesClubList.includes(x+1)){
                    console.log("þarf ekki breyta")
                }
                else if (preferencesFormList[x] === "on" && !preferencesClubList.includes(x+1)) {
                    console.log("bætt við stuff")

                    const {error} = await supabase.from("club_preferences").insert({club_id: editedClubData.clubId,preference_id:x+1})

                    if (error){
                        console.log("ERROR í editClub á meðan að insert-a í club preferences:",error)
                    }
                }
                else if (preferencesFormList[x] === null && preferencesClubList.includes(x+1)){
                    console.log("eyða stuff")
                    let idRow = undefined
                    for (let i of clubCategories){
                        if (i.club_id === Number(editedClubData.clubId) && i.preference_id === x+1){
                            idRow = i.id
                        }
                    }

                    const {error} = await supabase.from("club_preferences").delete().eq("id",idRow)
                    
                    if (error){
                        console.log("ERROR í editClub á meðan að delete-a í club preferences:",error)
                    }
                }
            }
            
            if (error){
                console.log("ERROR á meðan að setja preferences fyrir club:",error)
            }
        }
        redirect("/profile/"+cookie.get("haveSignedIn")?.value) // segir að vélið get ekki lesið undefined í 'id' í profile
    }

}

export async function club_preferences(clubId:Number){ 
    const {data, error} = await supabase.from("club_preferences").select().eq("club_id",Number(clubId))
    if (error){
        console.log("ERROR í club_preferences:",error)
    }

    return data
}
export async function allClubCategories(){ 
    const {data, error} = await supabase.from("club_preferences").select()
    if (error){
        console.log("ERROR í club_preferences:",error)
    }

    return data
}
export async function UploadUserImg(formdata: FormData) {
    console.log("run")
    const cookie = await cookies()
    const user = await getUserData(cookie.get("haveSignedIn")?.value)
    const img = formdata.get('file')
    try {
        const { data, error } = await supabase.storage
        .from('profile pic')
        .upload(img.name, img);
        console.log("img data ",data)
        console.log("img error ",error)
        const imgDtata = data
        if(!error){
            const { data, error } = await supabase
            .from('profiles')
            .update({ img: img.name })
            .eq('id',user.id)
            .select()
            console.log("profile data ",data)
            console.log("profile error ",error)
        }
      return { success: true };
    } catch (err) {
      console.error('Error:', err.message);
      return { success: false, message: err.message };
    }
  }
  