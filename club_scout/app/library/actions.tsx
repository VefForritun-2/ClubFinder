"use server";

export async function sign_up(formdata: FormData){
    const signUpData = {
        username: formdata.get("username"),
        password: formdata.get("password"),
        passwordCheck: formdata.get("passwordCheck")
    }
    const json_data = await fetch('/stuff.json')
    console.log(json_data)

    if (signUpData.password === signUpData.passwordCheck) {
        // setja gögnin in supabase or redirecta til main page
    }
    else{
        // rendera eitthvað sem sýnir notandinn að lykilorðið voru ekki eins
    }
    // þarf að finna út hvernig að byrta eitthvað þegar eitthvað er að og kannski gera layout
    // gera kafli 14 í next.js
}

export async function sign_in(formdata:FormData) {
    console.log("SIGN IN",formdata)
    // validate-a sign in með að sækja gögn og check-a og svo gefa cookie {örugg þarf að gera authentication}
}