<script>
    export let label = "";
    export let type = "";
    export let id = "";
    export let placeholder = "";
    export let value = "";

    const onInput = e => (value = e.target.value);
</script>

<div class="form-control">
    <label class="label" for={id}>
        <span class="label-text">{label}</span>
    </label>
    <input class="input input-bordered" {id} on:input={onInput} {placeholder} {type} {value}>
</div>
