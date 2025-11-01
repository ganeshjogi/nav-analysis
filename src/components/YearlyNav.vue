<script setup lang="ts">
import type { YearlyAggregatedNavData, PerDayNavData, NavApiResponse } from '@/models/nav-data'
import { onMounted } from 'vue'
import { reactive } from 'vue'
import Card from 'primevue/card'

const navData = reactive<YearlyAggregatedNavData[]>([])
const schemes = [
  '105628',
  '102941',
  '120586',
  '122639',
  '118968',
  '118525',
  '135800',
  '120473',
  '149760',
  '120716',
]

onMounted(async () => {
  await fetchNavs()
})

async function fetchNavs() {
  try {
    const today = new Date().toISOString().substring(0, 10)
    const oneYearAgo = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .substring(0, 10)

    const responsePromises: Promise<Response>[] = []

    schemes.forEach((scheme) => {
      responsePromises.push(
        fetch(`https://api.mfapi.in/mf/${scheme}?startDate=${oneYearAgo}&endDate=${today}`),
      )
    })

    const responses = await Promise.all(responsePromises)

    for (const response of responses) {
      const mfNavData = await response.json()
      const mfData: YearlyAggregatedNavData = {
        schemeName: mfNavData.meta.scheme_name,
        latestNav: mfNavData.data[0].nav,
        schemeCode: mfNavData.meta.scheme_code,
      }

      mfNavData.data.sort((a: PerDayNavData, b: PerDayNavData) => parseInt(a.nav) - parseInt(b.nav))

      mfData.yearlyHigh = mfNavData.data[mfNavData.data.length - 1].nav
      mfData.yearlyHighDate = mfNavData.data[mfNavData.data.length - 1].date
      mfData.yearlyLowDate = mfNavData.data[0].date
      mfData.yearlyLow = mfNavData.data[0].nav

      navData.push(mfData)
    }
  } catch (error) {
    console.error('Error fetching users:', error)
  }
}
</script>

<template>
  <template class="row justify-content-center">
    <Card class="col m-4" v-for="scheme in navData">
      <template #title>
        <div v-tooltip="scheme.schemeName" class="truncate-single-line">
          {{ scheme.schemeName }}
        </div>
      </template>
      <template #subtitle>{{ scheme.schemeCode }}</template>
      <template #content>
        <div class="row justify-content-evenly">
          <Card class="col">
            <template #title>Today</template>
            <template #content>
              <p class="m-0">
                {{ scheme.latestNav }}
              </p>
            </template>
          </Card>
          <Card class="col">
            <template #title>Low</template>
            <template #content>
              <p class="m-0">{{ scheme.yearlyLow }}</p>
            </template>
          </Card>
          <Card class="col">
            <template #title>High</template>
            <template #content>
              <p class="m-0">{{ scheme.yearlyHigh }}</p>
            </template>
          </Card>
        </div>
      </template>
    </Card>
  </template>
</template>

<style scoped>
h2 {
  color: #2c3e50;
}

.truncate-single-line {
  /* white-space: nowrap;
  overflow: hidden; */
  word-break: break-all;
}

/* Desktop view (screens larger than 1024px) */
@media screen and (min-width: 720px) {
  .truncate-single-line {
    max-width: 400px; /* Set a maximum width for desktop view */
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
