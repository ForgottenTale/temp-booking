import {Route,Redirect} from "react-router-dom";


export default function ProtectedRoute({isAuth,component:Component,path, ...rest}){

    return(
        <Route
        path={path}
         {...rest}
          render={(props)=>{
              if(isAuth === true){
                  return <Component {...rest}/>
              }
              else if(isAuth === false){
                return <Redirect to ={{
                    pathname:"/login",
                    state :{from:props.location}
                }}/>
              }
              else{
                  return null
              }
          }}
        />
    )
}