<!--
  - KodeBlox Copyright 2020 Sayak Mukhopadhyay
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  - http: //www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
  <div>
    <ed-toolbar>
    </ed-toolbar>
    <v-content>
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="6" lg="5">
            <v-img height="50vh"
                   contain
                   :src="require('@/assets/EliteShotsV1.svg')"
                   alt="Elite Shots Logo"
            />
          </v-col>
          <v-col cols="12" md="6" lg="7">
            <h1 class="display-3">Elite Shots</h1>
            <p class="mt-6">
              Elite Dangerous is a beautiful game and you can never have enough of space screenshots. Elite Shots is
              your single portal for all screenshots related to Elite Dangerous.
            </p>
            <v-btn color="primary" to="/guidelines" class="mr-2">Guidelines</v-btn>
            <v-btn outlined color="primary" href="https://github.com/SayakMukhopadhyay/eliteshots" target="_blank">
              Source
            </v-btn>
          </v-col>
        </v-row>
        <v-card class="my-5">
          <v-card-title>
            <span class="headline">For Commanders. By a Commander.</span>
          </v-card-title>
          <v-card-text>
            <v-row dense>
              <v-col cols="12" md="6" lg="3" class="d-flex justify-center flex-column">
                <v-icon size="128">favorite_border</v-icon>
                <div class="text-center mt-2">
                  <h2 class="mb-2">Like</h2>
                  <div>Like and save your favorite screenshots.</div>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="3" class="d-flex justify-center flex-column">
                <v-icon size="128">fas fa-upload</v-icon>
                <div class="text-center mt-2">
                  <h2 class="mb-2">Upload</h2>
                  <div>Upload the best screenshots that can wow the community.</div>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="3" class="d-flex justify-center flex-column">
                <v-icon size="128">star_border</v-icon>
                <div class="text-center mt-2">
                  <h2 class="mb-2">Curated</h2>
                  <div>Get curated! The curators will pick the best among the best.</div>
                </div>
              </v-col>
              <v-col cols="12" md="6" lg="3" class="d-flex justify-center flex-column">
                <v-icon size="128">share</v-icon>
                <div class="text-center mt-2">
                  <h2 class="mb-2">Share</h2>
                  <div>Share the screenshots to a variety of social media.</div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <h2>Reach me at</h2>
        <v-row>
          <v-col cols="12" md="6" lg="3">
            <v-card href="https://github.com/SayakMukhopadhyay" class="pt-5 card-img">
              <v-img width="50%"
                     height="50%"
                     contain
                     :src="require('@/assets/github-logo.svg')"
                     alt="Github Logo"/>
              <v-card-text>
                Github Profile
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card href="https://discord.gg/0uwCh6R62aQ0eeAX" class="pt-5 card-img">
              <v-img width="50%"
                     height="50%"
                     contain
                     :src="require('@/assets/edcd-logo.svg')"
                     alt="EDCD Logo"/>
              <v-card-text>
                EDCD Discord Server
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card href="https://forums.frontier.co.uk/member.php/136073-Garud" class="pt-5 card-img">
              <v-img width="50%"
                     height="50%"
                     contain
                     :src="require('@/assets/ed-logo.svg')"
                     alt="Elite Dangerous Logo"/>
              <v-card-text>
                Frontier Forums
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6" lg="3">
            <v-card href="https://discord.gg/AuHfMvq" class="pt-5 card-img">
              <v-img width="50%"
                     height="50%"
                     contain
                     :src="require('@/assets/discord-logo.svg')"
                     alt="Discord Logo"/>
              <v-card-text>
                Elite Shots Discord Server
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <h2>Brought to you By</h2>
        <v-row justify="center">
          <v-col cols="12" md="3" class="card-img">
            <v-img width="50%"
                   height="50%"
                   contain
                   :src="require('@/assets/garud-logo.svg')"
                   alt="Garud Logo"/>
            <h3>CMDR Garud</h3>
          </v-col>
          <v-col cols="12" md="1" class="card-img">
            <v-img width="50%"
                   height="50%"
                   contain
                   :src="require('@/assets/ampersand.svg')"
                   alt="Ampersand"/>
          </v-col>
          <v-col cols="12" md="3">
            <a href="https://knightsofkarma.com" target="_blank" class="card-img">
              <v-img width="50%"
                     height="50%"
                     contain
                     :src="require('@/assets/kok-logo.svg')"
                     alt="Knights of Karma Logo"/>
              <h3>Knights of Karma</h3>
            </a>
          </v-col>
          <v-col cols="12" md="1" class="card-img">
            <v-img width="50%"
                   height="50%"
                   contain
                   :src="require('@/assets/ampersand.svg')"
                   alt="Ampersand"/>
          </v-col>
          <v-col cols="12" md="3">
            <a href="https://twitter.com/GalPhotoED" target="_blank" class="card-img">
              <v-img width="50%"
                     height="50%"
                     contain
                     :src="require('@/assets/galphoto-logo.svg')"
                     alt="GalPhoto Logo"/>
              <h3>GalPhoto</h3>
            </a>
          </v-col>
        </v-row>
        <owner-info/>
        <h2>
          <router-link to="/about/termsandconditions">Terms and Conditions</router-link>
        </h2>
        <tandc-text/>
        <h2>
          <router-link to="/about/disclaimer">Disclaimer</router-link>
        </h2>
        <disclaimer-text/>
        <h2>
          <router-link to="/about/privacypolicy">Privacy Policy</router-link>
        </h2>
        <privacy-policy-text/>
      </v-container>
    </v-content>
  </div>
</template>

<script>
import Toolbar from '@/components/Toolbar'
import OwnerInfo from '@/components/about/OwnerInfo'
import TAndCText from '@/components/about/TAndCText'
import DisclaimerText from '@/components/about/DisclaimerText'
import PrivacyPolicyText from '@/components/about/PrivacyPolicyText'

export default {
  name: 'About',
  components: {
    'ed-toolbar': Toolbar,
    'owner-info': OwnerInfo,
    'tandc-text': TAndCText,
    'disclaimer-text': DisclaimerText,
    'privacy-policy-text': PrivacyPolicyText
  }
}
</script>

<style scoped>
  .card-img {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .card-img .v-card__text {
    text-align: center;
  }
</style>
