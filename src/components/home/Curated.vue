<template>
  <image-gallery :imageItems="curatedImages"
                 :loading="loadingNewImages"
                 :end="curatedImagesEnd"
                 @imageViewed="onClickThumbnail"
                 @imageLiked="onClickLike"
                 @imageSaved="onClickSave"
                 @fetchImages="onFetchImages"
                 :authenticated="auth.authenticated"></image-gallery>
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
      loadingNewImages: false
    }
  },
  computed: {
    ...mapState({
      curatedImages: state => state.images.curated,
      curatedImagesEnd: state => state.images.curatedEnd,
      auth: state => state.auth
    })
  },
  created () {
    this.$store.dispatch('checkAuthenticated')
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
      if (this.curatedImages && this.curatedImages.length > 0) {
        await this.$store.dispatch('fetchCurated', this.curatedImages[this.curatedImages.length - 1].curated_at)
        this.loadingNewImages = false
      } else {
        await this.$store.dispatch('fetchCurated', null)
        this.loadingNewImages = false
      }
    }
  }
}
</script>
