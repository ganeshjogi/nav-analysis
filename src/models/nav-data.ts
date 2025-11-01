export interface PerDayNavData {
  date: string
  nav: string
}

export interface YearlyAggregatedNavData {
  yearlyHigh?: number
  yearlyHighDate?: string
  yearlyLowDate?: string
  yearlyLow?: number
  latestNav: number
  schemeName: string
  schemeCode: number
}

export interface NavApiResponse {
  meta: {
    fund_house: string
    scheme_type: string
    scheme_category: string
    scheme_code: number
    scheme_name: string
    isin_growth: string
    isin_div_reinvestment: string
  }
  data: PerDayNavData[]
}
