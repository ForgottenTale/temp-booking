import Shimmer from "./shimmer";
import SkeletonElement from "./skeleton";


export default function SkeletonRowRequest() {
    return (
        <tr className="skeleton-wrapper">
            <td><SkeletonElement type="text" /> </td>
            <td >
                <div className="tableTag_user">
                    <SkeletonElement type="avatar" />
                                &nbsp; &nbsp;
                                <SkeletonElement type="text" />
                </div>

            </td>
           
                {[1, 2, 3].map((key) => <td key={key}><SkeletonElement type="text" /> </td>)}
                <td>  <Shimmer />
            </td>

        </tr >
    )
}