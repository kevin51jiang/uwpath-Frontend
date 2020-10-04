import Vuex from "vuex";
import Vue from "vue";

import createPersistedState from 'vuex-persistedstate';

import courses from "./modules/courses";
import programInfo from "./modules/programInfo"
import courseSelection from "./modules/courseSelection"
import email from "./modules/email"

import { CourseRequirement } from "../models/courseRequirementModel";
import { MajorRequirement, OtherRequirement } from "../models/ProgramModel";


Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        courses,
        courseSelection,
        programInfo,
        email
    },
    plugins: [
        createPersistedState({
            paths: [
                "courseSelection.table", "courseSelection.termList", "courseSelection.cacheTime",
                "courses.majorRequirements", "courses.minorRequirements", "courses.specRequirements",
                "programInfo"
            ],
            getState: (key) => {
                const value = window.localStorage.getItem(key);

                try {
                    if (typeof value !== "undefined") {
                        let obj = JSON.parse(value);
                        let today = new Date();
                        obj["courseSelection"]["cacheTime"] = new Date(obj["courseSelection"]["cacheTime"]);
                        if (!(obj["courseSelection"]["cacheTime"] instanceof Date &&
                              !isNaN(obj["courseSelection"]["cacheTime"]))) {
                            obj["courseSelection"]["cacheTime"] = today;
                        }

                        let hours = Math.abs(today - obj["courseSelection"]["cacheTime"]) / 36e5;
                        obj["courseSelection"]["cacheTime"] = today;

                        if (hours <= 24) {
                            for (var i in obj["courseSelection"]["table"]) {
                                for (var j in obj["courseSelection"]["table"][i]["courses"]) {
                                    let loadedCourseRequirement = new CourseRequirement(obj["courseSelection"]["table"][i]["courses"][j])
                                    loadedCourseRequirement.inRequirementBar = false
                                    obj["courseSelection"]["table"][i]["courses"][j] = loadedCourseRequirement
                                }
                            }
                            for (i in obj["courses"]["majorRequirements"]) {
                                obj["courses"]["majorRequirements"][i] = new MajorRequirement(obj["courses"]["majorRequirements"][i])
                            }

                            for (i in obj["courses"]["minorRequirements"]) {
                                obj["courses"]["minorRequirements"][i] = new OtherRequirement(obj["courses"]["minorRequirements"][i])
                            }

                            for (i in obj["courses"]["specRequirements"]) {
                                obj["courses"]["specRequirements"][i] = new OtherRequirement(obj["courses"]["specRequirements"][i])
                            }
                            obj["courseSelection"]["cacheTime"] = new Date(obj["courseSelection"]["cacheTime"]);
                        } else {
                            obj["courseSelection"]["cacheTime"] = today;
                            obj["courseSelection"]["table"] = JSON.parse(JSON.stringify(courseSelection.defaultTable));
                            obj["courseSelection"]["termList"] = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B"];
                            obj["courseSelection"]["checklistMajorRequirements"] = [];
                            obj["courseSelection"]["checklistMinorRequirements"] = [];
                            obj["courseSelection"]["checklistOptionRequirements"] = [];

                            obj["courses"]["majorRequirements"] = [];
                            obj["courses"]["minorRequirements"] = [];
                            obj["courses"]["specRequirements"] = [];

                            obj["programInfo"]["majors"] = [];
                            obj["programInfo"]["minors"] = [];
                            obj["programInfo"]["specialization"] = [];
                        }
                        return obj;
                    }
                } catch (err) {
                    console.error(err)
                }

                return undefined;
            },
            setState: (key, state) => {
                return window.localStorage.setItem(key, JSON.stringify(state));
            },
        })
    ]
})
