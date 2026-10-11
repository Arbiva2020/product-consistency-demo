import React from "react";
const dasboardComponents = ['ticketsRegected', 'ticketsPassed', 'tokensSaved']


export default function DashboardPage(){
  return (
    <>
    <div>Hello dashboard</div>
    <div>
      <div>Here the user will view stats regarding:</div>
      <ul>
      {dasboardComponents.map((comp, index)=>
        <li key={index}>{comp}</li>
        )}
      </ul>
    </div>
    </>
  )
}