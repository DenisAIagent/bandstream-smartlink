"use client"

import React from 'react'
import {Link} from '@/i18n/routing';
const SearchFormReset = () => {
    const reset = () => {
        const form = document.querySelector(".search-form") as HTMLFormElement;
    
        if(form) form.reset();
      }

  return (
    <button type="reset" onClick={reset}>
        <Link href="/" className="search-btn">
            x
        </Link>
    </button>
  )
}

export default SearchFormReset