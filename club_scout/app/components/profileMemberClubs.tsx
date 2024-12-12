import Link from "next/link";
import styles from "./profileMemberClubs.module.css";

// return-a club með nafn,description og logo-ið og id í key svo hún mun ekki væla
export default function memberOfClubs(name: string,descreption:string,logo:string,id:string,owner:boolean,username:string = "none"){
    if (owner === false){
        return(
            <div className={styles.club_element} key={id}>
                <div className={styles.club_info}>
                    <img src={logo} alt={logo}/>
                    <div className={styles.club_text}>
                        <p className={styles.club_title}>{name}</p>
                        <p className={styles.club_description}>{descreption}</p>
                        <div className={styles.club_actions}>
                            <Link className={styles.club_action_details} href={"/Club/"+id}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m9-3h.01"/><path d="M11 12h1v4h1"/></g></svg></Link>
                        </div>
                    </div>
                </div>
                
            </div>
        )
    }
    else if (owner === true){
        return(
            <div className={styles.club_element} key={id}>
                <div className={styles.club_info}>
                    <img src={logo} alt={logo}/>
                    <div className={styles.club_text}>
                        <p className={styles.club_title}>{name}</p>
                        <p className={styles.club_description}>{descreption}</p>
                    </div>
                </div>
                <div className={styles.club_actions}>
                    <Link className={styles.club_action_edit} href={"/profile/"+username+"/"+id}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"/><path d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3zM16 5l3 3"/></g></svg></Link>
                    <Link className={styles.club_action_details} href={"/Club/"+id}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0m9-3h.01"/><path d="M11 12h1v4h1"/></g></svg></Link>
                </div>
            </div>
        )
    }
}