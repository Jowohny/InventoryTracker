<script setup lang="ts">

const { $locally } = useNuxtApp();

interface BoxItem {
  producer: string,
  sizes: ('xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl')[]
}

interface Audit {
  name: string,
  action: string,
  container: Box,
  logTime: Date
}

interface Box {
  id: number,
  name: string,
  created: Date,
  // stock: BoxItem[]
}

//tye dye t-shirts
//woman t-shirts
//comfort colors
//youth clothing
//tank tops
//blankets
//misc. hoodies
//caps, beanies, aprons, washcloths...
//different sizes: xl-5xl; xs-xl
//different brands: different clothes; gilden, jersey textile
//maybe garbo bin
//qr code compatible

let boxes = ref<Box[]>([])
let auditLogs = ref<Audit[]>([])
const boxNameInput = ref('')
const openDrawer = ref(false)
const openModel1st = ref(false)
const openModel2nd = ref(false)
const userNameInput = ref('')

const sortedBoxes = computed(() => {
  return [...boxes.value].sort((a, b) => a.name.localeCompare(b.name))
})

onMounted(() => {
  const storedBoxes = $locally.getItem('boxes')
  if (storedBoxes) {
    boxes.value = storedBoxes.map((b: Box) => ({
      ...b,
      created: new Date(b.created)
    }))
  }
  const storedAudits = $locally.getItem('auditLogs')
  if (storedAudits) {
    auditLogs.value = storedAudits.map((a: Audit) => ({
      ...a,
      logTime: new Date(a.logTime),
      container: { ...a.container, created: new Date(a.container.created) }
    }))
  }
})

const removeBox = (id: number) => {
  boxes.value = boxes.value.filter(box => box.id !== id)
  $locally.setItem('boxes', boxes.value)
}

const addBox = () => {
  const boxFilter = boxes.value.filter(box => (box.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')).includes(boxNameInput.value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')))

  if(boxFilter.length > 0) {
    const newBox: Box = {
      id: Date.now(),
      name: `${boxNameInput.value} (${boxFilter.length})`,
      created: new Date(Date.now())
    }  
    boxes.value.push(newBox)
    addAuditEntry('addContainer', newBox)
  } else {
    const newBox: Box = {
      id: Date.now(),
      name: boxNameInput.value,
      created: new Date(Date.now())
    }
    boxes.value.push(newBox)  
    addAuditEntry('addContainer', newBox)
  }

  boxNameInput.value = ''
  $locally.setItem('boxes', boxes.value)
  openDrawer.value = false
}

const clearInventory = () => {
  boxes.value = []
  $locally.setItem('boxes', boxes.value)
  openModel1st.value = false
  openModel2nd.value = false
}

const addAuditEntry = (entryType: string, secondaryInput: Box) => {
  if(entryType === 'addContainer') {
    const newAudit: Audit = {
      name: userNameInput.value,
      action: 'added',
      container: secondaryInput,
      logTime: new Date(Date.now())
    }
    auditLogs.value.push(newAudit)
    $locally.setItem('auditLogs', auditLogs.value)
  } else if(entryType === 'removeContainer') {
    const newAudit: Audit = {
      name: userNameInput.value,
      action: 'removed',
      container: secondaryInput,
      logTime: new Date(Date.now())
    }
    auditLogs.value.push(newAudit)
    $locally.setItem('auditLogs', auditLogs.value)
  } else if(entryType === 'clearAll') {
    const newAudit: Audit = {
      name: userNameInput.value,
      action: 'cleared all containters',
      container: secondaryInput,
      logTime: new Date(Date.now())
    }
    auditLogs.value.push(newAudit)
    $locally.setItem('auditLogs', auditLogs.value)
  } else {
    return
  }
}

onUnmounted(() => {
  $locally.setItem('boxes', boxes.value)
  $locally.setItem('auditLogs', auditLogs.value)
  $locally.setItem('lastUser', userNameInput.value)
})

</script>

<template>
  <UApp>
    <div class="flex content-center justify-center m-4 flex-col">
      <div class="flex flex-col items-center">
        <img class="w-1/2" src="/image0.jpg">
        <input class="px-3 m-3 border text-center rounded-xl border-2" placeholder="Current User" v-model="userNameInput" type="text">
        <h1 class="text-4xl font-thin tracking-widest mb-4">Inventory</h1>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="text-center justify-end flex" v-for="(box, index) in sortedBoxes" :key="index">
          <div class="flex flex-col items-center mr-2 w-full">
            <img src="/box.jpg" class="h-12 w-16">
            <h1 class="tracking-tighter font-thin text-sm"> {{ box.name }} </h1>
          </div>
          <UButton class="self-start justify-self-end flex" icon="i-humbleicons-times" @click="removeBox(box.id)" size="md" color="error" variant="solid" />
        </div>
      </div>

      <UDrawer class="mb-2" :handle="false" should-scale-background>
        <UButton class="inline" label="View Total Inventory" color="neutral" variant="subtle"/>
          <template #content>
            <div class="p-4">
              <h1 class="text-center font-semibold leading-none tracking-wide"></h1>
              <div v-for="(box, i) in sortedBoxes" key="Box{{ i }}">
                <p class="font-semibold text-md tracking-wide leading-relaxed">{{ box.name }}</p>
                <p class="font-thin text-xs tracking-tight leading-snug">Added On: {{ box.created.toLocaleDateString() }} at {{ box.created.toLocaleTimeString() }}</p>
              </div>
            </div>
          </template>
      </UDrawer>

      <UDrawer class="mb-2" v-model:open="openDrawer" :dismissible="false" :handle="false" should-scale-background>
        <UButton class="inline" @click="openDrawer = true" label="Add New Container" color="neutral" variant="subtle"/>  
        <template #content>
          <div class="flex flex-col justify-items-center m-4">
            <h1 class="text-center font-semibold tracking-wide">Input Containter Name Here:</h1>
            <input class="px-3 mx-2 border rounded-xl border-green-800" v-model="boxNameInput" type="text" required>
            <div class="flex flex-row">
              <UButton class="my-2 mx-auto" label="Submit" @click="addBox" />
              <UButton class="my-2 mx-auto" label="Cancel" color="error" @click="openDrawer = false" />
            </div>
          </div>
        </template> 
      </UDrawer>
      
      <UDrawer :handle="false" should-scale-background>
        <UButton class="inline" label="Inventory Audit Log" color="neutral" variant="subtle"/>
        <template #content>
          <div class="my-1 mx-2" v-for="audits in auditLogs" :key="audits.name">
            <p class="block font-light text-md tracking-tight leading-none">
              <span class="font-bold">{{ audits.name }}</span> {{ audits.action }} '{{ audits.container?.name }}''
            </p>
            <p class="font-thin tracking-wide text-sm text-gray-600">
              Logged at {{ audits.logTime.toLocaleDateString() }} at {{ audits.logTime.toLocaleTimeString() }}
            </p>
          </div>
        </template>
      </UDrawer>

      <UModal
        title="Are you sure?"
        v-model:open="openModel1st"
        :close="{
          color: 'error',
          variant: 'outline',
          class: 'rounded-full'
        }">

        <UButton class="inline my-2" @click="openModel1st = true" label="Clear Inventory" color="error" variant="solid"/>

        <template #body>
          <div class="flex flex-row">
            <UModal
              title="Positive?"
              v-model:open="openModel2nd"
              :close="{
                color: 'error',
                variant: 'outline',
                class: 'rounded-full'
              }">

              <UButton class="mx-auto" @click="openModel2nd = true" variant="solid" color="error" label="Yes, I'm sure" />

              <template #body>
                <div class="flex flex-row">
                  <UButton class="mx-auto" @click="clearInventory" variant="solid" color="error" label="Absolutely" />
                  <UButton class="mx-auto" @click="openModel1st = false, openModel2nd = false" variant="subtle" color="neutral" label="Nevermind" />
                </div>
              </template>
            </UModal>
            <UButton class="mx-auto" @click="openModel1st = false" variant="subtle" color="neutral" label="Cancel" />
          </div>
        </template>
      </UModal>
    </div>
  </UApp>
</template>
