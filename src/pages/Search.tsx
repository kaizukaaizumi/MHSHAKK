import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import "leaflet/dist/leaflet.css";
import type { InsuranceProviders } from '~/server/api/routers/HealthcareRouter';
import { api } from '~/utils/api';
import Navbar from '~/components/Navbar';
import Serachbar from '~/components/SearchBar/Autocomplete';
const LeafletMap = dynamic(() => import('../components/LeafletMap'), { ssr: false });

const SearchPage: React.FC = () => {

    // this is used for filtering.
    // allow user to set insurance status (QUEST, none, or both)
    const [insurance, setInsurance] = useState<InsuranceProviders | undefined>();

    // if no insurance selected, select first 100 clinics.
    // if there is, plug it into our api.
    // this really needs to be one procedure with the insurance being optional.
    // this is unsorted. it is sorted however mongodb wants to sort it :)
    const { data: centers, isLoading } = insurance !== undefined ?
        api.healthcare.getByPlan.useQuery({ insurance }) :
        api.healthcare.getSome.useQuery();

    return (
        <div className="overflow-hidden h-screen">
            <Navbar/>
            <div className="w-screen h-[calc(100%-5rem)] flex">
                <div className="h-full bg-slate-30
                0 flex-col bg-slate-300 w-1/5">
                    <div>
                        <details className="dropdown flex justify-center">
                            {/* copy pasted drop down from daisyui / tailwinds because i am lazy. */}
                            <summary className="m-1 btn">CHOOSE YOUR INSURANCE</summary>
                            <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                                { /* this does NOT filter the entries you have already fetched. clicking on any of these buttons will query the DB again.
                                 Consider fetching entries on page load and filtering based on this. but HOW WOULD PAGINATION WORK??? */}
                                <li><a onClick={p => setInsurance("FQHC")}>Uninsured</a></li>
                                <li><a onClick={p => setInsurance("QI")}>Med-QUEST</a></li>
                                <li><a onClick={p => setInsurance(undefined)}>Any</a></li>
                            </ul>
                        </details>
                    </div>
                </div>
                <div className="h-full w-1/2 bg-slate-500
                0 flex-col overflow-y-scroll">
                    { /* tell the user to wait if we are still waiting on data to come in. 
                    DO NOT USE STATIC SITE GENERATION BECAUSE YOUTUBE DOESN'T DO THIS WHEN YOU SEARCH FOR VIDEOS
                    then, when we get the data we can map it out into a DIV for each center. rn we are missing a more info <button className=""></button>
                    */ }
                    {isLoading ? "Pls wait" : centers?.map(center => (
                        <div className={'m-2 bg-slate-100 h-40 rounded-3xl p-2'} key={center.id}>
                            <div className='text-2xl border-b-2'>
                                <a href={'/location/' + center.id} className={center.insurancePlans.includes("QI") ? "text-red-600" : "text-blue-500"}>
                                    {center.names[0] + " (" + (false || "Comprehensive Care") + ')'}
                                </a>
                            </div>

                            <div className='flex'>
                            <div>
                                <div>{center.website}</div>
                                <div>{center.address}</div>
                                <div>{center.healthCenterNumbers}</div>
                                <div>{center.insurancePlans}</div>
                            </div>
                            <button 
                            onClick={async (_) => {
                                let loc = "";
                                if(navigator.geolocation) {
                                    // getCurrentPosition requires a callback function.
                                    loc = await new Promise((res) => 
                                        navigator.geolocation.getCurrentPosition(
                                            // if they consent, get their latlon.
                                            p=>res(p.coords.latitude + ',' + p.coords.longitude),
                                            // otherwise, show google maps
                                            _err=>res(""),
                                            {
                                                enableHighAccuracy: true
                                            }
                                        )
                                    );
                                };
                                // open in new tab
                                window.open("https://www.google.com/maps/dir/" + loc + "/" + center.address);
                            }}
                            rel="noopener noreferrer" className="btn-success rounded-xl ml-auto h-fit mt-4 p-2 align-middle inline-block">Get Directions</button>
                            </div>
                        </div>
                    ))
                    }
                </div>
                { /* possibly feed the list of locations into here, it was requested/needed that the leaflet map should only show endpoints
                that are in the search results, but I bring up the problem of pagination again. */}
                <LeafletMap key={0} />
            </div>
            <div>
                <Serachbar/>
            </div>
        </div>
    );
};

export default SearchPage;