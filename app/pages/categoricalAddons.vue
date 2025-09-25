<script setup lang="ts">
import type { AccordionItem } from '@nuxt/ui'
import type { RadioGroupItem, RadioGroupValue } from '@nuxt/ui'
const { $locally } = useNuxtApp()

const indexAccordion = ref('0')
const organizationLists = ref<NestedOrganization[]>([])
const brandNameInput = ref('')
const typeNameInput = ref('')
const sizeNameInput = ref('')
const radioGroupBrand = ref<RadioGroupItem[]>([])
const radioValueBrand = ref<RadioGroupValue>('')
const radioGroupType = ref<RadioGroupItem[]>([])
const radioValueType = ref<RadioGroupValue>('')
const listedSizes = ref<string[]>([])

let brandMention = ref<NestedOrganization | undefined>(undefined);
let produceMention = ref<Produce | undefined>(undefined);

interface NestedOrganization {
	brand: string
	products: Produce[]
}

interface Produce {
	products: string
	sizes: string[]
}

watch(radioValueBrand, (value) => {
    brandMention.value = organizationLists.value.find(list => list.brand === value as string);
    if (brandMention.value) {
        radioValueType.value = ''; 
        radioGroupType.value = brandMention.value.products.map(p => ({
            label: p.products,
            value: p.products,
        }));
    } else {
        radioGroupType.value = [];
    }
});

watch(radioValueType, (value) => {
    const productsList = brandMention.value?.products || [];
    produceMention.value = productsList.find(list => list.products === value as string);
    if (produceMention.value) {
        listedSizes.value = [...produceMention.value.sizes];
    } else {
        listedSizes.value = [];
    }
});

onMounted(() => {
  try {
    const storedCategories = $locally.getItem('categories');
    
    if (storedCategories && Array.isArray(storedCategories)) {
      // 1. Safely assign the data
      organizationLists.value = storedCategories as NestedOrganization[];

      // 2. ONLY THEN populate the UI lists
      radioGroupBrand.value = organizationLists.value.map(item => ({
        label: item.brand,
        value: item.brand
      }));
      
    }
  } catch (e) {
    // If parsing fails, log the error and ensure the UI starts empty.
    console.error("Failed to load or parse categories from storage:", e);
    organizationLists.value = [];
    radioGroupBrand.value = [];
  }
});

onUnmounted(() => {
  if (organizationLists.value.length > 0) {
    $locally.setItem('categories', organizationLists.value)
  }
});


const items = ref<AccordionItem[]>([
  {
    label: 'Brand',
    icon: 'i-lineicons-nike',
    content: 'Enter the brands frequently bought from.'
  },
  {
    label: 'Types',
    icon: 'i-map-clothing-store',
    content: 'Enter the types of items sold.'
  },
  {
    label: 'Sizes',
    icon: 'i-mdi-size-xxxl',
    content: 'Enter the sizes included.'
  }
])

const addBrands = () => {
  const newProduce: Produce[] = []
  const newNO: NestedOrganization = {
    brand: brandNameInput.value,
    products: newProduce
  }
  const newB: RadioGroupItem = {
    label: brandNameInput.value,
    value: brandNameInput.value
  }
  radioGroupBrand.value.push(newB)
  radioValueBrand.value = brandNameInput.value 
  organizationLists.value.push(newNO)
  brandNameInput.value = '' 
}

const addTypes = () => {
  const findBrand = organizationLists.value.find(list => list.brand === radioValueBrand.value)
  if (!findBrand) return
  const newType: Produce = {
    products: typeNameInput.value,
    sizes: [] 
  }
  const newTypeItem: RadioGroupItem = {
    label: typeNameInput.value,
    value: typeNameInput.value
  }
  radioGroupType.value.push(newTypeItem) 
  findBrand.products.push(newType)
  radioValueType.value = typeNameInput.value 
  typeNameInput.value = ''
}

const addSizes = () => {
  const findProduce = organizationLists.value
    .find(list => list.brand === radioValueBrand.value)?.products
    .find(list => list.products === radioValueType.value)

  if (!findProduce) return

  listedSizes.value.push(sizeNameInput.value)
  findProduce.sizes.push(sizeNameInput.value)
  sizeNameInput.value = ''
}

</script>

<template>
  <h1 class=""></h1>
  <UAccordion v-model:model-value="indexAccordion" class="px-8 py-2" :items="items">
    <template #content="{item}">
      <p class="text-xs font-light mb-8 inline text-center leading-none mb-0">{{ item.content }}</p>

			<URadioGroup 
				v-if="indexAccordion ==='0'" 
				indicator="start" 
				variant="card" 
				class="mx-auto w-2/3 leading-snug my-0 p-0 tracking-wide text-lg" 
				v-model="radioValueBrand" 
				:items="radioGroupBrand"/>
			<URadioGroup 
				v-if="indexAccordion ==='1'" 
				indicator="start" 
				variant="card" 
				class="mx-auto w-2/3 leading-snug my-0 p-0 tracking-wide text-lg" 
				v-model="radioValueType" 
				:items="radioGroupType"/>

			<p v-if="indexAccordion === '2'" class="mx-auto w-2/3 leading-snug my-1 p-0 tracking-wide text-lg" v-for="size in listedSizes" :key="size">
				{{ size }}
			</p>

      <UModal v-if="indexAccordion === '0'">
        <div class="flex justify-center block">
					<UButton class="my-2" variant="solid" color="secondary">Add New {{ item.label }}</UButton>
				</div>
        <template #content>
          <h1 class="text-lg text-center my-2 font-bold">Add Brand</h1>
          <input class="rounded-full mx-3 mb-2 border px-3" v-model="brandNameInput" type="text">
          <UButton class="place-content-center mx-auto mb-2" label="Submit" variant="subtle" color="success" @click="addBrands"/>
        </template>
      </UModal>
			<UModal v-if="indexAccordion === '1'">
        <div class="flex justify-center block">
					<UButton class="my-2" variant="solid" color="secondary">Add New {{ item.label }}</UButton>
				</div>
        <template #content>
          <h1 class="text-lg text-center my-2 font-bold">Add Type</h1>
          <input class="rounded-full mx-3 mb-2 border px-3" v-model="typeNameInput" type="text">
          <UButton class="place-content-center mx-auto mb-2" label="Submit" variant="subtle" color="success" @click="addTypes"/>
        </template>
      </UModal>
			<UModal v-if="indexAccordion === '2'">
        <div class="flex justify-center block">
					<UButton class="my-2" variant="solid" color="secondary">Add New {{ item.label }}</UButton>
				</div>
        <template #content>
          <h1 class="text-lg text-center my-2 font-bold">Add Size</h1>
          <input class="rounded-full mx-3 mb-2 border px-3" v-model="sizeNameInput" type="text">
          <UButton class="place-content-center mx-auto mb-2" label="Submit" variant="subtle" color="success" @click="addSizes"/>
        </template>
      </UModal>
    </template>
  </UAccordion>

	<NuxtLink class="m-4 block flex justify-center" to="/">
		<UButton color="neutral" variant="subtle" label="Return Home"/>
	</NuxtLink>
</template>