<template>
  <div>
    <v-btn
      id="auth-button"
      v-if="isSignedIn"
      color="#f5f5f5"
      depressed
      v-on:click="signOut"
      small
      elevation="2"
    >
      Sign Out
    </v-btn>
    <v-btn
      id="auth-button"
      v-else
      color="#f5f5f5"
      depressed
      v-on:click="googleSignIn"
      small
      elevation="2"
    >
      <img width="17" class="google-auth-icon" src="../assets/googleLogo.png" />
      Clear Localstorage (Reset App)
    </v-btn>
    <v-dialog v-model="dialog" max-width="800" persistent>
      <div class="confirm-popup">
        <p>
          Would you like to keep your existing work or overwrite it with the
          plan on your account?
        </p>
        <div class="confirm-buttons">
          <v-btn @click="keepCurrentPlan()">Keep Current Plan</v-btn>
          <v-btn @click="loadPlan()">Load From Account</v-btn>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from "vuex";
import _ from "lodash";
import firebase from "firebase/app";
import "firebase/auth";

export default {
  name: "AuthButton",
  data() {
    return {
      dialog: false
    };
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setUser(user);
      } else {
        this.clearUser();
      }
    });
  },
  methods: {
    ...mapActions(["updateChecklist", "updateFirestore"]),
    ...mapMutations([
      "setUser",
      "clearUser",
      "loadCoursesFromFireStore",
      "loadCourseSelectionFromFirestore"
    ]),
    googleSignIn() {
      // Clear localstorage
      localStorage.clear();
    },
    loadPlan() {
      this.loadCoursesFromFireStore(this.coursesModule);
      this.loadCourseSelectionFromFirestore(this.courseSelectionModule);
      if (this.$route.name !== "CourseSelection") {
        this.$router.push("/CourseSelection");
      }
      this.dialog = false;
    },
    keepCurrentPlan() {
      this.updateFirestore();
      this.dialog = false;
    },
    plansMatch() {
      if (this.getTable.length !== this.courseSelectionModule.table.length) {
        return false;
      }
      for (let i = 0; i < this.getTable.length; i++) {
        if (
          !_.isEqual(
            this.getTable[i].courses.map(course => course.course_codes_raw),
            this.courseSelectionModule.table[i].courses.map(
              course => course.course_codes_raw
            )
          )
        ) {
          return false;
        }
      }
      for (let degree of Object.keys(this.checklistMajorRequirements)) {
        if (
          !this.courseSelectionModule.checklistMajorRequirements[degree] ||
          !_.isEqual(
            this.checklistMajorRequirements[degree].map(
              course => course.course_codes_raw
            ),
            this.courseSelectionModule.checklistMajorRequirements[degree].map(
              course => course.course_codes_raw
            )
          )
        ) {
          return false;
        }
      }
      for (let degree of Object.keys(this.checklistMinorRequirements)) {
        if (
          !this.courseSelectionModule.checklistMinorRequirements[degree] ||
          !_.isEqual(
            this.checklistMinorRequirements[degree].map(
              course => course.course_codes_raw
            ),
            this.courseSelectionModule.checklistMinorRequirements[degree].map(
              course => course.course_codes_raw
            )
          )
        ) {
          return false;
        }
      }
      for (let degree of Object.keys(this.checklistOptionRequirements)) {
        if (
          !this.courseSelectionModule.checklistOptionRequirements[degree] ||
          !_.isEqual(
            this.checklistOptionRequirements[degree].map(
              course => course.course_codes_raw
            ),
            this.courseSelectionModule.checklistOptionRequirements[degree].map(
              course => course.course_codes_raw
            )
          )
        ) {
          return false;
        }
      }
      return true;
    },
    signOut() {
      firebase.auth().signOut();
    }
  },
  computed: {
    ...mapGetters([
      "isSignedIn",
      "getDisplayName",
      "getUser",
      "majorRequirements",
      "getTable",
      "checklistMajorRequirements",
      "checklistMinorRequirements",
      "checklistOptionRequirements"
    ])
  }
};
</script>

<style scoped>
.confirm-popup {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  padding-top: 1.5rem;
  background-color: white;
  font-size: 1rem;
}

.confirm-buttons {
  margin: 1rem;
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.google-auth-icon {
  margin-right: 0.75rem;
}
</style>
