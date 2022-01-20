import React from 'react';
import { Button, Space } from 'antd';
import { Link } from 'react-router-dom';

const PTAPHeader = () => (
  <>
    <h3>Welcome to the Application for services with the Property Tax Appeal Project.</h3>

    <h1><b>The appeal window will open soon. Pre-filing appeals is now available.</b></h1>


    <h1>What is the Property Tax Appeal Project?</h1>
    <p>The Property Tax Appeal Project is a free legal service provided by the University of Michigan Law School 
      and the Coalition for Property Tax Justice. The Project's trained legal advocates can help you 
      understand the property tax appeal process and file an appeal. In 2020, 
      100% of our client's appeals were successful!
    </p>
    <h1>Why might you want to protest your property tax assessment?</h1>
    <p>Every year, the City of Detroit determines the "assessed value" of your home. 
      Your home's assessed value is used to calculate your property tax bill. 
      This means that if your assessed value is too high, your property tax bill will also probably be too high!</p>
    <p>State law says that your home's assessed value should be no higher than 50%
       of your home's market value. Market value is how much your home could sell for. 
       For example, if your home is worth (i.e. has a market value) $20,000, then it should be 
       assessed at no more than $10,000 (i.e. half of the market value).
    </p>
    <p>
      <b>The City over assesses and illegally inflates the taxes for most homes worth $50,000 and less. 
        If your home is worth $50,000 or less, then you should consider protesting your property tax assessment.
      </b>
    </p>
    <p>
    Protesting your property taxes with our Project is completely FREE. 
    Our team does most of the work for you and supports you during the whole process!
    </p>
    <p>
    If you want to learn more about the City's over assessment of property taxes, 
    you can click on the blue hyperlinks below for further reading:
    </p>
    <ul>
      <li>Between 2009-2015, the City of Detroit illegally inflated the “Assessed Value” for&nbsp;
        <a href='https://southerncalifornialawreview.com/2018/01/02/stategraft-article-by-bernadette-atuahene-timothy-r-hodge/'
           target='_blank' rel="noopener noreferrer">55% to 85%</a> of its properties.
      </li>
      <li>In 2019, the problem continued. The City illegally inflated the “Assessed Value” for 84% of the lowest valued homes.</li>
      <li>As a result, the City has overtaxed Detroit homeowners by at least&nbsp;
        <a href='https://www.detroitnews.com/story/news/local/detroit-city/housing/2020/01/09/detroit-homeowners-overtaxed-600-million/2698518001/'
           target='_blank' rel="noopener noreferrer">$600 million</a> and one out of every 3 homes went through property tax foreclosure.
      </li>
      <li><a href='https://scholarship.law.uci.edu/ucilr/vol9/iss4/3/' target='_blank' rel="noopener noreferrer">25% of the property tax foreclosures</a>
      &nbsp;of the lowest-valued homes would not have happened without these illegally inflated property tax assessments</li>
    </ul>
    <p>Check out a short video below and visit the <a href='https://illegalforeclosures.org/' target='_blank' rel="noopener noreferrer">
      Coalition for Property Tax Justice website</a> for more information!</p>
    <iframe title="Illegal Foreclosures" width="560" height="315" src="https://www.youtube.com/embed/J1wlRYB3p7E" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    <h1>How to protest your property tax assessment</h1>
    <p>Click the button below to get started on your Application with the Property Tax Appeal Project. </p>
    {/*
    <Space>
      <Button type="primary"><Link to="/detroitappeal">Click here to get started</Link></Button>
    </Space>
    */}

  </>
);

export default PTAPHeader;
