import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader = () => (
  <>
    <h1>Welcome to the Property Tax Appeal Project&apos;s automated appeal system for Detroit, Michigan.</h1>
    <p>This is a free legal service provided by the University of Michigan Law School and the Coalition for Property Tax Justice.</p>
    <h2>The Tax Foreclosure Crisis</h2>

    <ul>
      <li>According to the Michigan Constitution, cities cannot assess a property at more than 50% of its market value.</li>
      <li>So, if your home is worth $50,000, the “Assessed Value” on your property tax bill cannot be more than $25,000.</li>
      <li>But, between 2009-2015, the City of Detroit illegally inflated the “Assessed Value” for&nbsp;
        <a href='https://southerncalifornialawreview.com/2018/01/02/stategraft-article-by-bernadette-atuahene-timothy-r-hodge/'
           target='_blank' rel="noopener noreferrer">55% to 85%</a> of its properties.
      </li>
      <li>In 2019, the problem continued. The City illegally inflated the “Assessed Value” for 84% of the lowest valued homes.</li>
      <li>As a result, the City has overtaxed Detroit homeowners by at least&nbsp;
        <a href='https://www.detroitnews.com/story/news/local/detroit-city/housing/2020/01/09/detroit-homeowners-overtaxed-600-million/2698518001/'
           target='_blank' rel="noopener noreferrer">$600 million</a> and one out of every 3 homes went through property tax foreclosure.
      </li>
      <li><a href='https://scholarship.law.uci.edu/ucilr/vol9/iss4/3/' target='_blank' rel="noopener noreferrer">25% of the property tax foreclosures</a> of homes 
      lower in value would not have happened without these illegally inflated property tax assessments</li>
    </ul>
    <p>Check out a short video below and visit the <a href='https://illegalforeclosures.org/' target='_blank' rel="noopener noreferrer">
      Coalition for Property Tax Justice website</a> for more information!</p>
    <iframe title="Illegal Foreclosures" width="560" height="315" src="https://www.youtube.com/embed/J1wlRYB3p7E" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <h2>Why Should You Appeal Your Property Tax Assessment?</h2>
    <ul>
      <li>You can make sure that your property is correctly valued, which may lower your property taxes.</li>
      <li>Appealing is FREE -- our team does not charge any fee for our services!</li>
      <li>Appealing takes very little time  – Our team does a lot of the leg work for you.</li>
      <li>It is easy – you just need to complete our short online application OR call our hotline and our team will do it for you.</li>
    </ul>
    <h2>What is the Property Tax Appeal Project?</h2>
    <ul>
      <li>Our team is here both to help you file the appeal and to understand the appeal process.</li>
      <li>During the 2020 appeals process, 100% of our client’s appeals were successful!</li>
    </ul>
    <Space>
      <Button type="primary"><Link to="/detroitappeal">Click here to get started</Link></Button>
    </Space>
  </>
);

export default PTAPHeader;
