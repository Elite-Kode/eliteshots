<template>
  <div>
    <h1>Profile Data</h1>
    <v-layout row>
      <v-flex xs4>
        <v-subheader>Frontier ID</v-subheader>
      </v-flex>
      <v-flex xs8>
        <v-text-field :value="auth.user.frontier_id" readonly></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs4>
        <v-subheader>CMDR Name</v-subheader>
      </v-flex>
      <v-flex xs8>
        <v-text-field :value="auth.user.commander" readonly></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout row>
      <v-flex xs4>
        <v-subheader>Email</v-subheader>
      </v-flex>
      <v-flex xs8>
        <v-text-field :value="auth.user.email" readonly></v-text-field>
      </v-flex>
    </v-layout>
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
