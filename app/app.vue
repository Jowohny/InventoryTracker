<script setup lang="ts">
const { $locally } = useNuxtApp();

interface BoxItem {
  producer: string,
  sizes: ('xs' | 's' | 'm' | 'l' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl')[]
}

interface Audit {
  name: string,
  action: string,
  container: Box | null,
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
const editAccess = ref(false)
const validName = ref(false)
const boxNameInput = ref('')
const openDrawer = ref(false)
const openContainer1st = ref(false)
const openContainer2nd = ref(false)
const openAudit1st = ref(false)
const openAudit2nd = ref(false)
const userNameInput = ref('')
const auditPage = ref(1)
const itemsPerPage = 10

watch(userNameInput, (newUser) => {
  $locally.setItem('lastUser', newUser)
})

const sortedBoxes = computed(() => {
  return [...boxes.value].sort((a, b) => a.name.localeCompare(b.name))
})

const sortedAudit = computed(() => {
  return [...auditLogs.value].sort((a, b) => b.logTime.getTime() - a.logTime.getTime())
})

const paginatedAudits = computed(() => {
  const startIndex = (auditPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return sortedAudit.value.slice(startIndex, endIndex)
})

watch(sortedAudit, (list) => {
  const maxPage = Math.max(1, Math.ceil(list.length / itemsPerPage))
  if (auditPage.value > maxPage) {
    auditPage.value = maxPage
  }
})

watch(userNameInput, (user) => {
  editAccess.value = user.trim().length > 0;
});

watch(boxNameInput, (vName) => {
  validName.value = vName.trim().length > 2;
})

const toolTipMessage = computed(() => {
  if (!editAccess.value && !validName.value) {
    return "Please enter a username and a valid container name.";
  } else if (!editAccess.value) {
    return "Please enter a username to make edits.";
  } else if (!validName.value) {
    return "Container name must be at least 3 characters long.";
  }
  return "";
});

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
      container: a.container ? { ...a.container, created: new Date(a.container.created) } : a.container
    }))
  }
  const storedUser = $locally.getItem('lastUser')
  if (storedUser) {
    userNameInput.value = storedUser
  }
})

const removeBox = (id: number) => {
  const removed: Box = boxes.value.filter(box => box.id === id)[0]!
  boxes.value = boxes.value.filter(box => box.id !== id)
  $locally.setItem('boxes', boxes.value)
  addAuditEntry('removeContainer', removed)
}

const addBox = () => {
  const boxFilter = boxes.value.filter(box => (box.name.toLowerCase().trim()).includes(boxNameInput.value.toLowerCase().trim()))

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
  openContainer1st.value = false
  openContainer2nd.value = false
  addAuditEntry('clearAll', null)
}

const clearAuditLogs = () => {
  auditLogs.value = []
  const newAudit: Audit = {
    name: userNameInput.value,
    action: 'cleared all audit logs',
    container: null,
    logTime: new Date(Date.now())

  }
  auditLogs.value.push(newAudit)
  $locally.setItem('auditLogs', auditLogs.value)
}

const addAuditEntry = (entryType: string, secondaryInput: Box | null) => {
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
          <UButton class="self-start justify-self-end flex" :disabled="!editAccess" icon="i-humbleicons-times" @click="removeBox(box.id)" size="md" color="error" variant="solid" />
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
              <UTooltip class="my-2 mx-auto border" :delay-duration="0" :text="toolTipMessage">
                <UButton label="Submit" :disabled="!editAccess || !validName" @click="addBox" />
              </UTooltip>
              <UButton class="my-2 mx-auto" label="Cancel" color="error" @click="openDrawer = false" />
            </div>
          </div>
        </template> 
      </UDrawer>
      
      <UDrawer :handle="false" should-scale-background>
        <UButton class="inline mb-2" label="Inventory Audit Log" color="neutral" variant="subtle"/>
        <template #content>
          <div class="my-1 mb- mx-2" v-for="audits in paginatedAudits" :key="audits.name">
            <p class="block font-light text-md tracking-tight leading-none">
              <span class="font-bold">{{ audits.name }}</span> {{ audits.action }} <span v-if="audits.container !== null">'{{ audits.container?.name }}'</span>
            </p>
            <p class="font-thin tracking-wide text-sm text-gray-600">
              Logged at {{ audits.logTime.toLocaleDateString() }} at {{ audits.logTime.toLocaleTimeString() }}
            </p>
          </div>
          <div class="flex justify-center mt-4 mb-2">
            <UPagination v-model:page="auditPage" :items-per-page="itemsPerPage" :total="sortedAudit.length"/>
          </div>
        </template>
      </UDrawer>

      <UModal
        title="Are you sure?"
        v-model:open="openContainer1st"
        :close="{
          color: 'error',
          variant: 'outline',
          class: 'rounded-full'
        }">

        <UButton class="inline mb-2" @click="openContainer1st = true" label="Clear Inventory" color="error" variant="solid"/>

        <template #body>
          <div class="flex flex-row">
            <UModal
              title="Positive?"
              v-model:open="openContainer2nd"
              :close="{
                color: 'error',
                variant: 'outline',
                class: 'rounded-full'
              }">

              <UButton class="mx-auto" @click="openContainer2nd = true" variant="solid" color="error" label="Yes, I'm sure" />

              <template #body>
                <div class="flex flex-row">
                  <UButton class="mx-auto" @click="clearInventory" :disabled="editAccess" variant="solid" color="error" label="Absolutely" />
                  <UButton class="mx-auto" @click="openContainer1st = false, openContainer2nd = false" variant="subtle" color="neutral" label="Nevermind" />
                </div>
              </template>
            </UModal>
            <UButton class="mx-auto" @click="openContainer1st = false" variant="subtle" color="neutral" label="Cancel" />
          </div>
        </template>
      </UModal>

      <UModal
        title="Are you sure?"
        v-model:open="openAudit1st"
        :close="{
          color: 'error',
          variant: 'outline',
          class: 'rounded-full'
        }">

        <UButton class="inline mb-2" @click="openAudit1st = true" label="Clear Audit Logs" color="error" variant="solid"/>

        <template #body>
          <div class="flex flex-row">
            <UModal
              title="Affirmative?"
              v-model:open="openAudit2nd"
              :close="{
                color: 'error',
                variant: 'outline',
                class: 'rounded-full'
              }">

              <UButton class="mx-auto" @click="openAudit2nd = true" variant="solid" color="error" label="Yes..." />

              <template #body>
                <div class="flex flex-row">
                  <UButton class="mx-auto" @click="clearAuditLogs" :disabled="!editAccess" variant="solid" color="error" label="YES" />
                  <UButton class="mx-auto" @click="openAudit1st = false, openAudit2nd = false" variant="subtle" color="neutral" label="Nevermind" />
                </div>
              </template>
            </UModal>
            <UButton class="mx-auto" @click="openAudit1st = false" variant="subtle" color="neutral" label="Cancel" />
          </div>
        </template>
      </UModal>
    </div>
  </UApp>
</template>
