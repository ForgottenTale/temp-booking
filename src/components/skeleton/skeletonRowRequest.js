import Shimmer from "./shimmer";
import SkeletonElement from "./skeleton";
import React from 'react';


export default function SkeletonRowRequest() {
    return (

        <tr className="skeleton-wrapper">
            <td><SkeletonElement type="text" /> </td>
            <td >

                <SkeletonElement type="avatar" />
                                &nbsp; &nbsp;
                                <SkeletonElement type="text" />

            </td>

            {[1, 2, 3, 4, 5].map((key) => <td key={key}><SkeletonElement type="text" /> </td>)}
            <td > <Shimmer /></td >

        </tr >


    )
}