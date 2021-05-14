import './tile.scss';


export default function Tile({event}){

return(
    <div className="tile">
         <p>{event.title}</p>
    </div>
);

}