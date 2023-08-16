import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import HeadMeta from '@/components/HeadMeta'
import Header from '@/layout/Header'
import Footer from '@/layout/Footer'
import Main from '@/layout/Main'
import Categories from '@/components/Categories'
import axiosClient from '@/libraries/axiosClient';
import FlashSale from '@/components/FlashSale'
import BestSeller from '@/components/BestSeller'
import ProductList from '@/components/ProductList'
import Elementor from '@/components/Elementor'
import VideoNewProducts from '@/components/VideoNewProducts'
import Banner from '@/components/Banner'
import ChatOnline from '@/components/ChatOnline'


const inter = Inter({ subsets: ['latin'] })

export default function Home({categories,flashsale,bestseller,suppliers}) {
  return (
    <>
    <HeadMeta title ="Elysian"/>
    <Banner/>
    <Header/>
    <Main suppliers={suppliers}/>
    <Elementor/>
    <Categories categories={categories}/>
    <FlashSale flashsale={flashsale}/>
    <BestSeller bestseller={bestseller}/>
    <ProductList/>
    <VideoNewProducts/>
    <ChatOnline/>
    <Footer/>
    </>
  )
}

export async function getServerSideProps() {
  try {
    const response1 = await axiosClient.get('/user/categories');
    const response2 = await axiosClient.get('/questions/flashsale');
    const response3 = await axiosClient.get('/questions/bestseller');
    const response4 = await axiosClient.get('/user/suppliers');



  
    return {
      props: {
        categories: response1.data.payload,
        flashsale: response2.data.payload,
        bestseller: response3.data.payload,
        suppliers: response4.data.payload,
        

      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
