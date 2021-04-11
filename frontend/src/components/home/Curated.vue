<template>
  <image-gallery :authenticated="authenticated"
                 :end="imagesEnd"
                 :imageItems="curatedImages"
                 :loading="loadingNewImages"
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
  name: 'Curated',
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
      curatedImages: state => state.images.curated,
      authenticated: state => state.auth.authenticated
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
    this.$store.commit('terminateCurated')
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
      if (this.curatedImages && this.curatedImages.length > 0) {
        images = await this.$store.dispatch('fetchCurated', this.curatedImages[this.curatedImages.length - 1].curated_at)
      } else {
        images = await this.$store.dispatch('fetchCurated', null)
      }
      this.imagesEnd = images.length === 0
      this.loadingNewImages = false
    }
  }
}
</script>
