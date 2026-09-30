import Seo from '../components/ui/Seo'
import Hero from '../components/sections/Hero'
import StoryCategories from '../components/sections/StoryCategories'
import TripTabsCarousel from '../components/sections/TripTabsCarousel'
import PromoBanner from '../components/sections/PromoBanner'
import UpcomingTrips from '../components/sections/UpcomingTrips'
import DestinationCarousel from '../components/sections/DestinationCarousel'
import GoogleReviews from '../components/sections/GoogleReviews'
import WhyChooseUs from '../components/sections/WhyChooseUs'
import InstagramSection from '../components/sections/InstagramSection'
import BlogsSection from '../components/sections/BlogsSection'
import FaqSection from '../components/sections/FaqSection'
import FinalCTA from '../components/sections/FinalCTA'

const all = () => true
const byType = (type) => (t) => t.type === type
const byDest = (d) => (t) => t.destination === d

const TRENDING_TABS = [
  { label: 'All Trips', filter: all },
  { label: 'Treks', filter: byType('Trek') },
  { label: 'Group Tours', filter: byType('Group Tour') },
  { label: 'Spiritual', filter: byType('Spiritual') },
  { label: 'Weekend', filter: byType('Weekend') },
]
const BESTSELLER_TABS = [
  { label: 'Uttarakhand', filter: byDest('Uttarakhand') },
  { label: 'Himachal', filter: byDest('Himachal Pradesh') },
  { label: 'Beyond the Hills', filter: (t) => !['Uttarakhand', 'Himachal Pradesh'].includes(t.destination) },
]
const byReviews = (a, b) => b.reviews - a.reviews
const byRating = (a, b) => b.rating - a.rating || b.reviews - a.reviews

export default function Home() {
  return (
    <>
      <Seo description="Group tours, Himalayan treks, Kedarnath yatras and custom trips from Dehradun. Expert-led, safe and priced direct. Book on WhatsApp in minutes." />
      <Hero />
      <StoryCategories />
      <TripTabsCarousel id="trending" title="Trending Trips" tabs={TRENDING_TABS} sort={byReviews} />
      <PromoBanner />
      <UpcomingTrips />
      <TripTabsCarousel id="best" title="Best Sellers" tabs={BESTSELLER_TABS} sort={byRating} ribbon="Bestseller" viewAll="/trips?sort=rating" />
      <DestinationCarousel />
      <GoogleReviews />
      <WhyChooseUs />
      <InstagramSection />
      <BlogsSection />
      <FaqSection />
      <FinalCTA />
    </>
  )
}
