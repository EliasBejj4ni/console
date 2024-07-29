<script lang="ts">
  import Display from './display.svelte';
  import Edit from './edit.svelte';
  import * as Tabs from "$lib/components/ui/tabs";
  import { onMount } from 'svelte';

  let activeTab = '';

  onMount(() => {
    const storedTab = localStorage.getItem('activeTab');
    if (storedTab) {
      activeTab = storedTab;
    }
  });

  function handleTabChange(value: string) {
    activeTab = value;
    localStorage.setItem('activeTab', value);
  }
</script>

<Tabs.Root bind:value={activeTab} class="w-full " on:change={(event) => handleTabChange(event.detail.value)}>
  <Tabs.List class="grid w-full grid-cols-2 ">
    <Tabs.Trigger value="display">Display {activeTab} </Tabs.Trigger>
    <Tabs.Trigger value="edit">Edit</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="display">
    <Display/>
  </Tabs.Content>
  <Tabs.Content value="edit">
    <Edit/>
  </Tabs.Content>
</Tabs.Root>
