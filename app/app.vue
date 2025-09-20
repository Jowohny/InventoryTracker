<script setup lang="ts">

let boxCount: number = 10

</script>

<template>
  <UApp>
    <div class="flex content-center justify-center m-4 flex-col">
      <div>
        <img class="w-1/2 justify-self-center" src="/image0.jpg">
        <h1 class="text-4xl font-thin tracking-widest m-4 justify-self-center">Inventory</h1>
      </div>
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="text-center" v-for="_ in boxCount">
          <img src="/box.jpg">
        </div>
      </div>

      <UDrawer :handle="false" should-scale-background>
        <UButton class="inline" label="View Total Inventory" color="neutral" variant="subtle"/>
          <template #content>
            <div>bean jar</div>
          </template>
      </UDrawer>
    </div>
  </UApp>
</template>
