import {Route,Redirect,useLocation} from "react-router-dom";


export default function ProtectedRoute({isAuth,component:Component,path, ...rest}){

    const {state} = useLocation();
    return(
        <Route
        
        {...rest}
          render={(props)=>{
              if(isAuth!==true){
                  return <Component {...rest}/>
              }
              else if(isAuth!==false){
                return <Redirect to ={state?.from||'/dashboard'}/>
              }
              else{
                return null
              }
          }}
        />
    )
}