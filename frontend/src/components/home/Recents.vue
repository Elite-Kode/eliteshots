<template>
  <image-gallery :authenticated="authenticated"
                 :end="imagesEnd"
                 :imageItems="recentImages"
                 :loading="loadingNewImages"
                 curation-banner
                 link-key="image_location"
                 @fetchImages="onFetchImages"
                 @imageLiked="onClickLike"
                 @imageSaved="onClickSave"
                 @imageViewed="onClickThumbnail"/>
</template>

<script>
import ImageGallery from '@/components/ImageGallery'
import { mapState } from 'vuex'

export default {
  name: 'Recents',
  components: {
    'image-gallery': ImageGallery
  },
  data () {
    return {
      loadingNewImages: false,
      imagesEnd: false
    }
  },
  computed: {
    ...mapState({
      recentImages: state => state.images.recents,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateRecents')
  },
  methods: {
    onClickThumbnail (image) {
      this.$store.dispatch('triggerImageViewed', image)
    },
    onClickLike (image) {
      this.$store.dispatch('triggerImageLiked', image)
    },
    onClickSave (image) {
      this.$store.dispatch('triggerImageSaved', image)
    },
    async onFetchImages () {
      this.loadingNewImages = true
      let images = []
      if (this.recentImages && this.recentImages.length > 0) {
        images = await this.$store.dispatch('fetchRecents', this.recentImages[this.recentImages.length - 1].uploaded_at)
      } else {
        images = await this.$store.dispatch('fetchRecents', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
