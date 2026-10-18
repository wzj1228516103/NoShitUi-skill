<script>let open = $state(false);</script>
<main><h1>Quiet Studio</h1><button onclick={() => open = true}>About this space</button>{#if open}<p>The dialog still needs to be designed.</p>{/if}</main>
