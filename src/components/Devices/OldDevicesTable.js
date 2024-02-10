


// <div className="flex flex-row flex-col">
//                 <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
//                     <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
//                         <div className="overflow-hidden">
//                             <table className="min-w-full">
//                                 <thead className="border-b bg-gray-800">
//                                     <tr>
//                                         <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
//                                             Name
//                                         </th>
//                                         <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
//                                             Type
//                                         </th>
//                                         <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
//                                             Mgmt IP
//                                         </th>
//                                         <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
//                                             Latest Backup
//                                         </th>
//                                         <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
//                                             Next Backup
//                                         </th>
//                                         <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     { loading ? (
//                                     <>
//                                         {[...Array(10)].map((_, i) => (
//                                             <SkeletonRow key={i} colspan={6} />
//                                         ))}
//                                     </>
//                                     ) : (
//                                         devicesToShow.map(device => (
//                                             <DeviceRow config={config} device={device} updateDevices={reloadData} key={device.deviceId} />
//                                         ))
//                                     )}
//                                 </tbody>
//                             </table>
//                             <DevicesFooter handleRowsPerPageChange={handleRowsPerPageChange} handlePageChange={handlePageChange} currentPage={currentPage} rowsPerPage={rowsPerPage} devicesLength={devices.length}/>
                           
//                         </div>
//                     </div>
//                 </div>
//             </div>