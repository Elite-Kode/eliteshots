<template>
  <div>
    <h1>Profile Data</h1>
    <v-row>
      <v-col cols="4">
        <v-subheader>Frontier ID</v-subheader>
      </v-col>
      <v-col cols="8">
        <v-text-field :value="auth.user.frontier_id" readonly/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-subheader>CMDR Name</v-subheader>
      </v-col>
      <v-col cols="8">
        <v-text-field :value="auth.user.commander" readonly/>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="4">
        <v-subheader>Email</v-subheader>
      </v-col>
      <v-col cols="8">
        <v-text-field :value="auth.user.email" readonly/>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Data',
  computed: {
    ...mapState({
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.dispatch('fetchAuthUser')
  }
}
</script>
