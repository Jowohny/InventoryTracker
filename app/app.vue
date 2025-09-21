<script setup lang="ts">
import { drawer } from '#build/ui';

const { $locally } = useNuxtApp();

interface Box {
  id: number,
  name: string,
  created: Date
}

let boxes = ref<Box[]>([])
const boxNameInput = ref('')
const openDrawer = ref(false)

onMounted(() => {
  if($locally.getItem('boxes')) {
    const storedBoxes = $locally.getItem('boxes')
    boxes.value = storedBoxes.map((box: any) => ({
      ...box,
      created: new Date(box.created)
    }))
  }
})

const removeBox = (id: number) => {
  boxes.value = boxes.value.filter(box => box.id !== id)
  $locally.setItem('boxes', boxes.value)
}

const addBox = () => {
  const newBox: Box = {
    id: Date.now(),
    name: boxNameInput.value,
    created: new Date()
  }
  boxes.value.push(newBox)
  boxNameInput.value = ''
  $locally.setItem('boxes', boxes.value)
  openDrawer.value = false
}

onUnmounted(() => {
  $locally.setItem('boxes', boxes.value)
})

</script>

<template>
  <UApp>
    <div class="flex content-center justify-center m-4 flex-col">
      <div>
        <img class="w-1/2 justify-self-center" src="/image0.jpg">
        <h1 class="text-4xl font-thin tracking-widest m-4 justify-self-center">Inventory</h1>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="text-center justify-end flex" v-for="(box, index) in boxes" :key="index">
          <div class="flex flex-col items-center justify-start justify-items-center mr-2">
            <img src="/box.jpg" class="h-4/5 w-4/5">
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
              <div v-for="(box, i) in boxes" key="Box{{ i }}">
                <p class="font-semibold text-md tracking-wide leading-relaxed">{{ box.name }}</p>
                <p class="font-thin text-xs tracking-tight leading-snug">Added On: {{ box.created.toLocaleDateString() }} at {{ box.created.toLocaleTimeString() }}</p>
              </div>
            </div>
          </template>
      </UDrawer>

      <UDrawer v-model:open="openDrawer" :dismissible="false" :handle="false" should-scale-background>
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
    </div>
  </UApp>
</template>
