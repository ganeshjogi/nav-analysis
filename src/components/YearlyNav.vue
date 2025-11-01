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
    <Card class="col-5 m-3" v-for="scheme in navData">
      <template #title>
        <div v-tooltip="scheme.schemeName" class="truncate-single-line">
          {{ scheme.schemeName }}
        </div>
      </template>
      <template #subtitle>{{ scheme.schemeCode }}</template>
      <template #content>
        <div class="d-flex justify-content-evenly">
          <Card>
            <template #title>Today</template>
            <template #content>
              <p class="m-0">
                {{ scheme.latestNav }}
              </p>
            </template>
          </Card>
          <Card>
            <template #title>Low</template>
            <template #content>
              <p class="m-0">{{ scheme.yearlyLow }}</p>
            </template>
          </Card>
          <Card>
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
  white-space: nowrap; /* Prevents text from wrapping to the next line */
  overflow: hidden; /* Hides any overflowing content */
  text-overflow: ellipsis; /* Displays an ellipsis to indicate truncated text */
}
</style>
