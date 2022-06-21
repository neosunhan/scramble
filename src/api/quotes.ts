import axios from 'axios'

interface Quote {
  content: string
}

export function getQuote() {
  return axios.get<Quote>('http://api.quotable.io/random')
}
