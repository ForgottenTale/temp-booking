import './tile.scss';


export default function Tile({event,setEventList,tileStyle}){




return(
    <div className="tile" onClick={()=>setEventList(true)} style={tileStyle}>
       
         <span>{event.title}</span>
    </div>
);

}