<script setup lang="ts">
import { useRoute } from 'vue-router';
const route = useRoute()

const { $locally } = useNuxtApp()

interface Box {
  id: number,
  name: string,
  created: Date,
}

let boxId = route.params.id
const box = ref<Box | undefined>()

const fetchBox = () => {
    const storedBoxes = $locally.getItem('boxes') as Box[] | null
    if (storedBoxes) {
        const foundBox = storedBoxes.find(b => b.name === boxId)
        box.value = foundBox
    }
};

onMounted(() => {
    fetchBox();
});

watch(() => route.params.id, (newId) => {
    if (newId) {
        boxId = newId
        fetchBox()
    }
});

</script>

<template>
    <div class="p-4">
        <div class="flex flex-col place-content-center" v-if="box">
            <h1 class="text-center text-4xl font-thin tracking-widest mb-4">Container Details</h1>
            <img src="/box.jpg" class="h-24 w-32 mx-auto">
            <h2 class="text-2xl text-center font-bold mt-4">{{ box.name }}</h2>
            <p class=" text-center font-thin text-sm text-gray-600">
                Added on: {{ new Date(box.created).toLocaleDateString() }} at {{ new Date(box.created).toLocaleTimeString() }}
            </p>
        </div>
        <div v-else>
            <p>Loading or container not found...</p>
        </div>
    </div>
</template>