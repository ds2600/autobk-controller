

function SkeletonRow({colspan}) {
    return (
        <>
            <tr className="bg-white border-b">
            <td colSpan={colspan} className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                <div className="animate-pulse">
                    <div className="bg-gray-300 h-8 w-full rounded "></div>
                </div>
            </td>
        </tr>    
        </>
    )
    
}

export default SkeletonRow;