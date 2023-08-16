import React from 'react'
import { useState,useEffect } from "react";
import Link from "next/link";
import { BsFillSearchHeartFill } from "react-icons/bs";


const InputSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="search-bar xs-hidden">
    <form className="search-form clearfix" action="" method="GET">
      <input
        placeholder="Search keywords... "
        type="text"
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button type="submit" aria-label="Search" title="Search">
      <Link className="search-button"  href={`/productsSearch?searchTerm=${encodeURIComponent(searchTerm)}`}><BsFillSearchHeartFill style={{fontSize:"24px",color:"#5a5a5a"}}/></Link>
      </button>
    </form>
  </div>
  )
}

export default InputSearch